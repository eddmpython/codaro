var e=`meta:\r
  packages:\r
  - folium\r
  id: folium_06\r
  title: GeoJSON 활용\r
  order: 6\r
  category: folium\r
  difficulty: ⭐⭐⭐\r
  badge: 중급\r
  tags:\r
  - folium\r
  - GeoJSON\r
  - GeoJson\r
  - 지역경계\r
  - 스타일\r
  seo:\r
    title: Folium GeoJSON - 지역 경계 표시\r
    description: Folium으로 GeoJSON 데이터를 사용합니다. 지역 경계를 그리고 스타일을 적용합니다.\r
    keywords:\r
    - folium\r
    - GeoJSON\r
    - GeoJson\r
    - 지역경계\r
    - style_function\r
intro:\r
  emoji: 🗾\r
  goal: GeoJSON 데이터로 지역 경계를 표시합니다.\r
  description: GeoJSON은 지리 정보를 표현하는 표준 형식입니다. 도시 경계, 행정구역, 도로 등을 표현합니다. Folium의 GeoJson()으로 이 데이터를 지도에\r
    표시하고 스타일을 적용합니다.\r
  direction: GeoJSON 활용에서 위치 데이터를 지도 레이어로 배치하고 마커/영역 표시를 검증합니다.\r
  benefits:\r
  - 위도/경도 데이터 확인 후 지도 레이어 구성에 맞는 코드 입력을 고릅니다.\r
  - GeoJSON 활용 결과를 마커와 저장 HTML 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 위치 기반 리포트에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 라이브러리 불러오기 입력 확인\r
      detail: 입력 기준(위도/경도 데이터)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. GeoJSON 구조 처리 실행\r
      detail: 지도 레이어 구성 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 폴리곤 GeoJSON 결과 검증\r
      detail: 마커와 저장 HTML 기준으로 실행 결과를 비교합니다.\r
    - label: GeoJSON 활용 재사용\r
      detail: 완성 코드를 위치 기반 리포트에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 지도 시각화 환경\r
      detail: folium 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: GeoJSON 활용 실행\r
      detail: 셀을 실행해 마커와 저장 HTML와 예외 상태를 확인합니다.\r
    - label: GeoJSON 활용 완료\r
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
- id: step2_geojson_structure\r
  title: 2단계. GeoJSON 구조\r
  structuredPrimary: true\r
  subtitle: 기본 형식\r
  goal: 2단계. GeoJSON 구조에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    GeoJSON은 type, geometry, properties로 구성됩니다. geometry에 좌표 정보가 있고, properties에 속성 정보가 있습니다.\r
\r
    주의: GeoJSON은 [경도, 위도] 순서입니다. Folium의 [위도, 경도]와 반대입니다.\r
  snippet: |-\r
    pointGeo = {\r
        "type": "Feature",\r
        "geometry": {\r
            "type": "Point",\r
            "coordinates": [126.9780, 37.5665]\r
        },\r
        "properties": {\r
            "name": "서울시청"\r
        }\r
    }\r
    pointGeo\r
  exercise:\r
    prompt: 2단계. GeoJSON 구조 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      pointGeo = {\r
          "type": "Feature",\r
          "geometry": {\r
              "type": "Point",\r
              "coordinates": [126.9780, 37.5665]\r
          },\r
          "properties": {\r
              "name": "서울시청"\r
          }\r
      }\r
      pointGeo\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 2단계. GeoJSON 구조에서 \`pointGeo\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 2단계. GeoJSON 구조 실행 뒤 \`pointGeo\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.\r
- id: step3_polygon_geojson\r
  title: 3단계. 폴리곤 GeoJSON\r
  structuredPrimary: true\r
  subtitle: 영역 데이터\r
  goal: 3단계. 폴리곤 GeoJSON에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    Polygon 타입으로 영역을 표현합니다. 좌표 리스트의 리스트 형태이고, 시작점과 끝점이 같아야 합니다.\r
\r
    Polygon 좌표는 이중 리스트입니다. 외곽선과 내부 구멍을 표현하기 위함입니다.\r
  snippet: |-\r
    seoulCenter = [37.5665, 126.9780]\r
    m1 = folium.Map(location=seoulCenter, zoom_start=14)\r
\r
    areaGeo = {\r
        "type": "Feature",\r
        "geometry": {\r
            "type": "Polygon",\r
            "coordinates": [[\r
                [126.9730, 37.5630],\r
                [126.9830, 37.5630],\r
                [126.9830, 37.5700],\r
                [126.9730, 37.5700],\r
                [126.9730, 37.5630]\r
            ]]\r
        },\r
        "properties": {\r
            "name": "시청 주변"\r
        }\r
    }\r
\r
    folium.GeoJson(areaGeo).add_to(m1)\r
\r
    m1\r
  exercise:\r
    prompt: 3단계. 폴리곤 GeoJSON 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      seoulCenter = [37.5665, 126.9780]\r
      m1 = folium.Map(location=seoulCenter, zoom_start=14)\r
\r
      areaGeo = {\r
          "type": "Feature",\r
          "geometry": {\r
              "type": "Polygon",\r
              "coordinates": [[\r
                  [126.9730, 37.5630],\r
                  [126.9830, 37.5630],\r
                  [126.9830, 37.5700],\r
                  [126.9730, 37.5700],\r
                  [126.9730, 37.5630]\r
              ]]\r
          },\r
          "properties": {\r
              "name": "시청 주변"\r
          }\r
      }\r
\r
      folium.GeoJson(areaGeo).add_to(m1)\r
\r
      m1\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 3단계. 폴리곤 GeoJSON에서 \`seoulCenter\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 3단계. 폴리곤 GeoJSON 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step4_feature_collection\r
  title: 4단계. FeatureCollection\r
  structuredPrimary: true\r
  subtitle: 여러 도형 묶기\r
  goal: 4단계. FeatureCollection에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    FeatureCollection으로 여러 Feature를 하나로 묶습니다. 대부분의 GeoJSON 파일은 이 형태입니다.\r
\r
    properties에 원하는 속성을 추가할 수 있습니다. name, value, category 등 다양한 정보를 담습니다.\r
  snippet: |-\r
    m2 = folium.Map(location=seoulCenter, zoom_start=13)\r
\r
    areasGeo = {\r
        "type": "FeatureCollection",\r
        "features": [\r
            {\r
                "type": "Feature",\r
                "geometry": {\r
                    "type": "Polygon",\r
                    "coordinates": [[\r
                        [126.9730, 37.5630],\r
                        [126.9780, 37.5630],\r
                        [126.9780, 37.5680],\r
                        [126.9730, 37.5680],\r
                        [126.9730, 37.5630]\r
                    ]]\r
                },\r
                "properties": {"name": "A구역", "value": 100}\r
            },\r
            {\r
                "type": "Feature",\r
                "geometry": {\r
                    "type": "Polygon",\r
                    "coordinates": [[\r
                        [126.9780, 37.5630],\r
                        [126.9830, 37.5630],\r
                        [126.9830, 37.5680],\r
                        [126.9780, 37.5680],\r
                        [126.9780, 37.5630]\r
                    ]]\r
                },\r
                "properties": {"name": "B구역", "value": 80}\r
            },\r
            {\r
                "type": "Feature",\r
                "geometry": {\r
                    "type": "Polygon",\r
                    "coordinates": [[\r
                        [126.9730, 37.5680],\r
                        [126.9780, 37.5680],\r
                        [126.9780, 37.5730],\r
                        [126.9730, 37.5730],\r
                        [126.9730, 37.5680]\r
                    ]]\r
                },\r
                "properties": {"name": "C구역", "value": 60}\r
            }\r
        ]\r
    }\r
\r
    folium.GeoJson(areasGeo).add_to(m2)\r
\r
    m2\r
  exercise:\r
    prompt: 4단계. FeatureCollection 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      m2 = folium.Map(location=seoulCenter, zoom_start=13)\r
\r
      areasGeo = {\r
          "type": "FeatureCollection",\r
          "features": [\r
              {\r
                  "type": "Feature",\r
                  "geometry": {\r
                      "type": "Polygon",\r
                      "coordinates": [[\r
                          [126.9730, 37.5630],\r
                          [126.9780, 37.5630],\r
                          [126.9780, 37.5680],\r
                          [126.9730, 37.5680],\r
                          [126.9730, 37.5630]\r
                      ]]\r
                  },\r
                  "properties": {"name": "A구역", "value": 100}\r
              },\r
              {\r
                  "type": "Feature",\r
                  "geometry": {\r
                      "type": "Polygon",\r
                      "coordinates": [[\r
                          [126.9780, 37.5630],\r
                          [126.9830, 37.5630],\r
                          [126.9830, 37.5680],\r
                          [126.9780, 37.5680],\r
                          [126.9780, 37.5630]\r
                      ]]\r
                  },\r
                  "properties": {"name": "B구역", "value": 80}\r
              },\r
              {\r
                  "type": "Feature",\r
                  "geometry": {\r
                      "type": "Polygon",\r
                      "coordinates": [[\r
                          [126.9730, 37.5680],\r
                          [126.9780, 37.5680],\r
                          [126.9780, 37.5730],\r
                          [126.9730, 37.5730],\r
                          [126.9730, 37.5680]\r
                      ]]\r
                  },\r
                  "properties": {"name": "C구역", "value": 60}\r
              }\r
          ]\r
      }\r
\r
      folium.GeoJson(areasGeo).add_to(m2)\r
\r
      m2\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 4단계. FeatureCollection에서 \`m2\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 4단계. FeatureCollection 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step5_style_function\r
  title: 5단계. 스타일 함수\r
  structuredPrimary: true\r
  subtitle: style_function\r
  goal: 5단계. 스타일 함수에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: |-\r
    style_function으로 GeoJSON 요소의 스타일을 지정합니다. 함수는 feature를 받아 스타일 딕셔너리를 반환합니다.\r
\r
    feature["properties"]로 속성에 접근합니다. 값에 따라 다른 색상을 반환하면 데이터 시각화가 됩니다.\r
  snippet: |-\r
    m3 = folium.Map(location=seoulCenter, zoom_start=13)\r
\r
    def styleFunc(feature):\r
        return {\r
            "fillColor": "green",\r
            "color": "darkgreen",\r
            "weight": 2,\r
            "fillOpacity": 0.4\r
        }\r
\r
    folium.GeoJson(\r
        areasGeo,\r
        style_function=styleFunc\r
    ).add_to(m3)\r
\r
    m3\r
  exercise:\r
    prompt: 5단계. 스타일 함수 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      m3 = folium.Map(location=seoulCenter, zoom_start=13)\r
\r
      def styleFunc(feature):\r
          return {\r
              "fillColor": "green",\r
              "color": "darkgreen",\r
              "weight": 2,\r
              "fillOpacity": 0.4\r
          }\r
\r
      folium.GeoJson(\r
          areasGeo,\r
          style_function=styleFunc\r
      ).add_to(m3)\r
\r
      m3\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    noError: 5단계. 스타일 함수의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 5단계. 스타일 함수 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: step6_popup_tooltip\r
  title: 6단계. 팝업과 툴팁\r
  structuredPrimary: true\r
  subtitle: GeoJsonPopup, GeoJsonTooltip\r
  goal: 6단계. 팝업과 툴팁에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    GeoJsonPopup과 GeoJsonTooltip으로 클릭/호버 시 정보를 표시합니다. fields에 표시할 속성을 지정합니다.\r
\r
    aliases로 표시되는 라벨을 변경할 수 있습니다. fields와 같은 순서로 지정합니다.\r
  snippet: |-\r
    m5 = folium.Map(location=seoulCenter, zoom_start=13)\r
\r
    folium.GeoJson(\r
        areasGeo,\r
        style_function=lambda x: {"fillColor": "blue", "fillOpacity": 0.3},\r
        popup=folium.GeoJsonPopup(fields=["name", "value"])\r
    ).add_to(m5)\r
\r
    m5\r
  exercise:\r
    prompt: 6단계. 팝업과 툴팁 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      m5 = folium.Map(location=seoulCenter, zoom_start=13)\r
\r
      folium.GeoJson(\r
          areasGeo,\r
          style_function=lambda x: {"fillColor": "blue", "fillOpacity": 0.3},\r
          popup=folium.GeoJsonPopup(fields=["name", "value"])\r
      ).add_to(m5)\r
\r
      m5\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 6단계. 팝업과 툴팁에서 \`m5\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 6단계. 팝업과 툴팁 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step7_highlight\r
  title: 7단계. 하이라이트 효과\r
  structuredPrimary: true\r
  subtitle: highlight_function\r
  goal: 7단계. 하이라이트 효과에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: |-\r
    highlight_function으로 마우스 호버 시 스타일을 변경합니다.\r
\r
    하이라이트는 인터랙티브 지도에서 사용자 경험을 향상시킵니다.\r
  snippet: |-\r
    m7 = folium.Map(location=seoulCenter, zoom_start=13)\r
\r
    def normalStyle(feature):\r
        return {\r
            "fillColor": "blue",\r
            "color": "black",\r
            "weight": 1,\r
            "fillOpacity": 0.3\r
        }\r
\r
    def highlightStyle(feature):\r
        return {\r
            "fillColor": "yellow",\r
            "color": "black",\r
            "weight": 3,\r
            "fillOpacity": 0.7\r
        }\r
\r
    folium.GeoJson(\r
        areasGeo,\r
        style_function=normalStyle,\r
        highlight_function=highlightStyle,\r
        tooltip=folium.GeoJsonTooltip(fields=["name"])\r
    ).add_to(m7)\r
\r
    m7\r
  exercise:\r
    prompt: 7단계. 하이라이트 효과 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      m7 = folium.Map(location=seoulCenter, zoom_start=13)\r
\r
      def normalStyle(feature):\r
          return {\r
              "fillColor": "blue",\r
              "color": "black",\r
              "weight": 1,\r
              "fillOpacity": 0.3\r
          }\r
\r
      def highlightStyle(feature):\r
          return {\r
              "fillColor": "yellow",\r
              "color": "black",\r
              "weight": 3,\r
              "fillOpacity": 0.7\r
          }\r
\r
      folium.GeoJson(\r
          areasGeo,\r
          style_function=normalStyle,\r
          highlight_function=highlightStyle,\r
          tooltip=folium.GeoJsonTooltip(fields=["name"])\r
      ).add_to(m7)\r
\r
      m7\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    noError: 7단계. 하이라이트 효과의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 7단계. 하이라이트 효과 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: step8_line_geojson\r
  title: 8단계. 라인 GeoJSON\r
  structuredPrimary: true\r
  subtitle: LineString\r
  goal: 8단계. 라인 GeoJSON에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    LineString 타입으로 선(경로, 도로)을 표현합니다.\r
\r
    LineString은 좌표들을 연결한 선입니다. 도로, 경로, 강 등을 표현합니다.\r
  snippet: |-\r
    m8 = folium.Map(location=[37.54, 126.95], zoom_start=13)\r
\r
    routeGeo = {\r
        "type": "Feature",\r
        "geometry": {\r
            "type": "LineString",\r
            "coordinates": [\r
                [126.9200, 37.5283],\r
                [126.9300, 37.5300],\r
                [126.9400, 37.5350],\r
                [126.9500, 37.5400]\r
            ]\r
        },\r
        "properties": {\r
            "name": "한강 산책로",\r
            "distance": "3km"\r
        }\r
    }\r
\r
    folium.GeoJson(\r
        routeGeo,\r
        style_function=lambda x: {\r
            "color": "blue",\r
            "weight": 5,\r
            "opacity": 0.8\r
        },\r
        tooltip=folium.GeoJsonTooltip(fields=["name", "distance"])\r
    ).add_to(m8)\r
\r
    m8\r
  exercise:\r
    prompt: 8단계. 라인 GeoJSON 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      m8 = folium.Map(location=[37.54, 126.95], zoom_start=13)\r
\r
      routeGeo = {\r
          "type": "Feature",\r
          "geometry": {\r
              "type": "LineString",\r
              "coordinates": [\r
                  [126.9200, 37.5283],\r
                  [126.9300, 37.5300],\r
                  [126.9400, 37.5350],\r
                  [126.9500, 37.5400]\r
              ]\r
          },\r
          "properties": {\r
              "name": "한강 산책로",\r
              "distance": "3km"\r
          }\r
      }\r
\r
      folium.GeoJson(\r
          routeGeo,\r
          style_function=lambda x: {\r
              "color": "blue",\r
              "weight": 5,\r
              "opacity": 0.8\r
          },\r
          tooltip=folium.GeoJsonTooltip(fields=["name", "distance"])\r
      ).add_to(m8)\r
\r
      m8\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 8단계. 라인 GeoJSON에서 \`m8\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 8단계. 라인 GeoJSON 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step9_seoul_gu\r
  title: 9단계. 서울 구 경계 예제\r
  structuredPrimary: true\r
  subtitle: 행정구역\r
  goal: 9단계. 서울 구 경계 예제에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: |-\r
    서울의 구 경계를 간단한 GeoJSON으로 표현합니다.\r
\r
    실제 행정구역 GeoJSON은 data.seoul.go.kr 등에서 다운로드할 수 있습니다.\r
  snippet: |-\r
    m9 = folium.Map(location=[37.56, 126.98], zoom_start=12)\r
\r
    seoulGu = {\r
        "type": "FeatureCollection",\r
        "features": [\r
            {\r
                "type": "Feature",\r
                "geometry": {\r
                    "type": "Polygon",\r
                    "coordinates": [[\r
                        [126.96, 37.58],\r
                        [127.00, 37.58],\r
                        [127.00, 37.61],\r
                        [126.96, 37.61],\r
                        [126.96, 37.58]\r
                    ]]\r
                },\r
                "properties": {"name": "종로구", "population": 150000}\r
            },\r
            {\r
                "type": "Feature",\r
                "geometry": {\r
                    "type": "Polygon",\r
                    "coordinates": [[\r
                        [126.96, 37.55],\r
                        [127.00, 37.55],\r
                        [127.00, 37.58],\r
                        [126.96, 37.58],\r
                        [126.96, 37.55]\r
                    ]]\r
                },\r
                "properties": {"name": "중구", "population": 130000}\r
            },\r
            {\r
                "type": "Feature",\r
                "geometry": {\r
                    "type": "Polygon",\r
                    "coordinates": [[\r
                        [126.96, 37.52],\r
                        [127.00, 37.52],\r
                        [127.00, 37.55],\r
                        [126.96, 37.55],\r
                        [126.96, 37.52]\r
                    ]]\r
                },\r
                "properties": {"name": "용산구", "population": 230000}\r
            }\r
        ]\r
    }\r
\r
    def popStyle(feature):\r
        pop = feature["properties"]["population"]\r
        if pop >= 200000:\r
            return {"fillColor": "red", "fillOpacity": 0.5, "color": "black", "weight": 2}\r
        elif pop >= 150000:\r
            return {"fillColor": "orange", "fillOpacity": 0.5, "color": "black", "weight": 2}\r
        else:\r
            return {"fillColor": "green", "fillOpacity": 0.5, "color": "black", "weight": 2}\r
\r
    folium.GeoJson(\r
        seoulGu,\r
        style_function=popStyle,\r
        tooltip=folium.GeoJsonTooltip(\r
            fields=["name", "population"],\r
            aliases=["구:", "인구:"]\r
        )\r
    ).add_to(m9)\r
\r
    m9\r
  exercise:\r
    prompt: 9단계. 서울 구 경계 예제 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      m9 = folium.Map(location=[37.56, 126.98], zoom_start=12)\r
\r
      seoulGu = {\r
          "type": "FeatureCollection",\r
          "features": [\r
              {\r
                  "type": "Feature",\r
                  "geometry": {\r
                      "type": "Polygon",\r
                      "coordinates": [[\r
                          [126.96, 37.58],\r
                          [127.00, 37.58],\r
                          [127.00, 37.61],\r
                          [126.96, 37.61],\r
                          [126.96, 37.58]\r
                      ]]\r
                  },\r
                  "properties": {"name": "종로구", "population": 150000}\r
              },\r
              {\r
                  "type": "Feature",\r
                  "geometry": {\r
                      "type": "Polygon",\r
                      "coordinates": [[\r
                          [126.96, 37.55],\r
                          [127.00, 37.55],\r
                          [127.00, 37.58],\r
                          [126.96, 37.58],\r
                          [126.96, 37.55]\r
                      ]]\r
                  },\r
                  "properties": {"name": "중구", "population": 130000}\r
              },\r
              {\r
                  "type": "Feature",\r
                  "geometry": {\r
                      "type": "Polygon",\r
                      "coordinates": [[\r
                          [126.96, 37.52],\r
                          [127.00, 37.52],\r
                          [127.00, 37.55],\r
                          [126.96, 37.55],\r
                          [126.96, 37.52]\r
                      ]]\r
                  },\r
                  "properties": {"name": "용산구", "population": 230000}\r
              }\r
          ]\r
      }\r
\r
      def popStyle(feature):\r
          pop = feature["properties"]["population"]\r
          if pop >= 200000:\r
              return {"fillColor": "red", "fillOpacity": 0.5, "color": "black", "weight": 2}\r
          elif pop >= 150000:\r
              return {"fillColor": "orange", "fillOpacity": 0.5, "color": "black", "weight": 2}\r
          else:\r
              return {"fillColor": "green", "fillOpacity": 0.5, "color": "black", "weight": 2}\r
\r
      folium.GeoJson(\r
          seoulGu,\r
          style_function=popStyle,\r
          tooltip=folium.GeoJsonTooltip(\r
              fields=["name", "population"],\r
              aliases=["구:", "인구:"]\r
          )\r
      ).add_to(m9)\r
\r
      m9\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    noError: 9단계. 서울 구 경계 예제의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 9단계. 서울 구 경계 예제 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: step10_complete\r
  title: 10단계. 완성 예제\r
  structuredPrimary: true\r
  subtitle: 구역별 정보 지도\r
  goal: 10단계. 완성 예제에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: GeoJSON으로 구역을 표시하고 스타일, 팝업, 하이라이트를 모두 적용합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    zoneMap = folium.Map(location=seoulCenter, zoom_start=13, tiles="CartoDB Positron")\r
\r
    zonesGeo = {\r
        "type": "FeatureCollection",\r
        "features": [\r
            {\r
                "type": "Feature",\r
                "geometry": {\r
                    "type": "Polygon",\r
                    "coordinates": [[\r
                        [126.970, 37.560],\r
                        [126.980, 37.560],\r
                        [126.980, 37.570],\r
                        [126.970, 37.570],\r
                        [126.970, 37.560]\r
                    ]]\r
                },\r
                "properties": {"name": "상업지구", "type": "commercial", "score": 85}\r
            },\r
            {\r
                "type": "Feature",\r
                "geometry": {\r
                    "type": "Polygon",\r
                    "coordinates": [[\r
                        [126.980, 37.560],\r
                        [126.990, 37.560],\r
                        [126.990, 37.570],\r
                        [126.980, 37.570],\r
                        [126.980, 37.560]\r
                    ]]\r
                },\r
                "properties": {"name": "주거지구", "type": "residential", "score": 72}\r
            },\r
            {\r
                "type": "Feature",\r
                "geometry": {\r
                    "type": "Polygon",\r
                    "coordinates": [[\r
                        [126.970, 37.570],\r
                        [126.980, 37.570],\r
                        [126.980, 37.580],\r
                        [126.970, 37.580],\r
                        [126.970, 37.570]\r
                    ]]\r
                },\r
                "properties": {"name": "녹지지구", "type": "green", "score": 90}\r
            }\r
        ]\r
    }\r
\r
    colorMap = {\r
        "commercial": "#e74c3c",\r
        "residential": "#3498db",\r
        "green": "#2ecc71"\r
    }\r
\r
    def zoneStyle(feature):\r
        zoneType = feature["properties"]["type"]\r
        return {\r
            "fillColor": colorMap.get(zoneType, "gray"),\r
            "color": "white",\r
            "weight": 2,\r
            "fillOpacity": 0.5\r
        }\r
\r
    def zoneHighlight(feature):\r
        return {\r
            "fillColor": "yellow",\r
            "color": "black",\r
            "weight": 3,\r
            "fillOpacity": 0.8\r
        }\r
\r
    folium.GeoJson(\r
        zonesGeo,\r
        style_function=zoneStyle,\r
        highlight_function=zoneHighlight,\r
        tooltip=folium.GeoJsonTooltip(\r
            fields=["name", "type", "score"],\r
            aliases=["구역:", "용도:", "점수:"],\r
            style="font-size: 12px;"\r
        ),\r
        popup=folium.GeoJsonPopup(\r
            fields=["name", "score"],\r
            aliases=["구역명:", "평가점수:"]\r
        )\r
    ).add_to(zoneMap)\r
\r
    zoneMap\r
  exercise:\r
    prompt: 10단계. 완성 예제 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      zoneMap = folium.Map(location=seoulCenter, zoom_start=13, tiles="CartoDB Positron")\r
\r
      zonesGeo = {\r
          "type": "FeatureCollection",\r
          "features": [\r
              {\r
                  "type": "Feature",\r
                  "geometry": {\r
                      "type": "Polygon",\r
                      "coordinates": [[\r
                          [126.970, 37.560],\r
                          [126.980, 37.560],\r
                          [126.980, 37.570],\r
                          [126.970, 37.570],\r
                          [126.970, 37.560]\r
                      ]]\r
                  },\r
                  "properties": {"name": "상업지구", "type": "commercial", "score": 85}\r
              },\r
              {\r
                  "type": "Feature",\r
                  "geometry": {\r
                      "type": "Polygon",\r
                      "coordinates": [[\r
                          [126.980, 37.560],\r
                          [126.990, 37.560],\r
                          [126.990, 37.570],\r
                          [126.980, 37.570],\r
                          [126.980, 37.560]\r
                      ]]\r
                  },\r
                  "properties": {"name": "주거지구", "type": "residential", "score": 72}\r
              },\r
              {\r
                  "type": "Feature",\r
                  "geometry": {\r
                      "type": "Polygon",\r
                      "coordinates": [[\r
                          [126.970, 37.570],\r
                          [126.980, 37.570],\r
                          [126.980, 37.580],\r
                          [126.970, 37.580],\r
                          [126.970, 37.570]\r
                      ]]\r
                  },\r
                  "properties": {"name": "녹지지구", "type": "green", "score": 90}\r
              }\r
          ]\r
      }\r
\r
      colorMap = {\r
          "commercial": "#e74c3c",\r
          "residential": "#3498db",\r
          "green": "#2ecc71"\r
      }\r
\r
      def zoneStyle(feature):\r
          zoneType = feature["properties"]["type"]\r
          return {\r
              "fillColor": colorMap.get(zoneType, "gray"),\r
              "color": "white",\r
              "weight": 2,\r
              "fillOpacity": 0.5\r
          }\r
\r
      def zoneHighlight(feature):\r
          return {\r
              "fillColor": "yellow",\r
              "color": "black",\r
              "weight": 3,\r
              "fillOpacity": 0.8\r
          }\r
\r
      folium.GeoJson(\r
          zonesGeo,\r
          style_function=zoneStyle,\r
          highlight_function=zoneHighlight,\r
          tooltip=folium.GeoJsonTooltip(\r
              fields=["name", "type", "score"],\r
              aliases=["구역:", "용도:", "점수:"],\r
              style="font-size: 12px;"\r
          ),\r
          popup=folium.GeoJsonPopup(\r
              fields=["name", "score"],\r
              aliases=["구역명:", "평가점수:"]\r
          )\r
      ).add_to(zoneMap)\r
\r
      zoneMap\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    noError: 10단계. 완성 예제의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 10단계. 완성 예제 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: step11_workflow\r
  title: 11단계. GeoJSON 경계 데이터 검증\r
  structuredPrimary: true\r
  subtitle: 좌표 순서와 속성 누락 확인\r
  goal: 11단계. GeoJSON 경계 데이터 검증에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    GeoJSON 업무에서 가장 흔한 오류는 지도가 안 그려지는 문제가 아니라, 그럴듯하게 그려졌지만 좌표 순서나 속성 키가 틀린 상태입니다. 실행 전에 [경도, 위도] 순서를 예측하고, 폴리곤이 닫혔는지, 필수 속성이 있는지 검증해야 합니다.\r
\r
    GeoJSON은 좌표 순서와 속성 키가 맞아야 분석 지도로 믿을 수 있습니다. 지도 렌더링 전 검증 함수를 통과시키는 습관이 실무 품질을 만듭니다.\r
  snippet: |-\r
    deliveryZonesGeo = {\r
        "type": "FeatureCollection",\r
        "features": [\r
            {\r
                "type": "Feature",\r
                "geometry": {\r
                    "type": "Polygon",\r
                    "coordinates": [[\r
                        [126.970, 37.560],\r
                        [126.985, 37.560],\r
                        [126.985, 37.572],\r
                        [126.970, 37.572],\r
                        [126.970, 37.560],\r
                    ]],\r
                },\r
                "properties": {"zoneId": "A", "name": "중심 권역", "slaMinutes": 25},\r
            },\r
            {\r
                "type": "Feature",\r
                "geometry": {\r
                    "type": "Polygon",\r
                    "coordinates": [[\r
                        [126.985, 37.560],\r
                        [127.000, 37.560],\r
                        [127.000, 37.572],\r
                        [126.985, 37.572],\r
                        [126.985, 37.560],\r
                    ]],\r
                },\r
                "properties": {"zoneId": "B", "name": "동부 권역", "slaMinutes": 35},\r
            },\r
        ],\r
    }\r
\r
    requiredProperties = {"zoneId", "name", "slaMinutes"}\r
    len(deliveryZonesGeo["features"]), requiredProperties\r
  exercise:\r
    prompt: 11단계. GeoJSON 경계 데이터 검증 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      deliveryZonesGeo = {\r
          "type": "FeatureCollection",\r
          "features": [\r
              {\r
                  "type": "Feature",\r
                  "geometry": {\r
                      "type": "Polygon",\r
                      "coordinates": [[\r
                          [126.970, 37.560],\r
                          [126.985, 37.560],\r
                          [126.985, 37.572],\r
                          [126.970, 37.572],\r
                          [126.970, 37.560],\r
                      ]],\r
                  },\r
                  "properties": {"zoneId": "A", "name": "중심 권역", "slaMinutes": 25},\r
              },\r
              {\r
                  "type": "Feature",\r
                  "geometry": {\r
                      "type": "Polygon",\r
                      "coordinates": [[\r
                          [126.985, 37.560],\r
                          [127.000, 37.560],\r
                          [127.000, 37.572],\r
                          [126.985, 37.572],\r
                          [126.985, 37.560],\r
                      ]],\r
                  },\r
                  "properties": {"zoneId": "B", "name": "동부 권역", "slaMinutes": 35},\r
              },\r
          ],\r
      }\r
\r
      requiredProperties = {"zoneId", "name", "slaMinutes"}\r
      len(deliveryZonesGeo["features"]), requiredProperties\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 11단계. GeoJSON 경계 데이터 검증에서 \`deliveryZonesGeo\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 11단계. GeoJSON 경계 데이터 검증 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: GeoJSON 활용\r
  goal: 실습에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 지금까지 배운 내용을 활용하여 미션을 수행해봅시다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import folium\r
    deliveryZones = {\r
        "type": "FeatureCollection",\r
        "features": [\r
            {\r
                "type": "Feature",\r
                "geometry": {\r
                    "type": "Polygon",\r
                    "coordinates": [[\r
                        [126.970, 37.560],\r
                        [126.985, 37.560],\r
                        [126.985, 37.575],\r
                        [126.970, 37.575],\r
                        [126.970, 37.560]\r
                    ]]\r
                },\r
                "properties": {"zone": "A", "fee": 0}\r
            },\r
            {\r
                "type": "Feature",\r
                "geometry": {\r
                    "type": "Polygon",\r
                    "coordinates": [[\r
                        [126.960, 37.550],\r
                        [126.995, 37.550],\r
                        [126.995, 37.585],\r
                        [126.960, 37.585],\r
                        [126.960, 37.550]\r
                    ]]\r
                },\r
                "properties": {"zone": "B", "fee": 1000}\r
            }\r
        ]\r
    }\r
    deliveryZones\r
  exercise:\r
    prompt: 실습 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      import folium\r
      deliveryZones = {\r
          "type": "FeatureCollection",\r
          "features": [\r
              {\r
                  "type": "Feature",\r
                  "geometry": {\r
                      "type": "Polygon",\r
                      "coordinates": [[\r
                          [126.970, 37.560],\r
                          [126.985, 37.560],\r
                          [126.985, 37.575],\r
                          [126.970, 37.575],\r
                          [126.970, 37.560]\r
                      ]]\r
                  },\r
                  "properties": {"zone": "A", "fee": 0}\r
              },\r
              {\r
                  "type": "Feature",\r
                  "geometry": {\r
                      "type": "Polygon",\r
                      "coordinates": [[\r
                          [126.960, 37.550],\r
                          [126.995, 37.550],\r
                          [126.995, 37.585],\r
                          [126.960, 37.585],\r
                          [126.960, 37.550]\r
                      ]]\r
                  },\r
                  "properties": {"zone": "B", "fee": 1000}\r
              }\r
          ]\r
      }\r
      deliveryZones\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 실습에서 \`deliveryZones\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 실습 실행 뒤 \`deliveryZones\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.\r
`;export{e as default};