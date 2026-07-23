var e=`meta:\r
  packages:\r
  - branca\r
  - folium\r
  id: folium_07\r
  title: 단계구분도\r
  order: 7\r
  category: folium\r
  difficulty: ⭐⭐⭐\r
  badge: 중급\r
  tags:\r
  - folium\r
  - Choropleth\r
  - 단계구분도\r
  - 컬러맵\r
  - 범례\r
  seo:\r
    title: Folium Choropleth - 단계구분도 만들기\r
    description: Folium으로 Choropleth 지도를 만듭니다. 지역별 데이터를 색상으로 시각화합니다.\r
    keywords:\r
    - folium\r
    - Choropleth\r
    - 단계구분도\r
    - 지역통계\r
    - 시각화\r
intro:\r
  emoji: 🌈\r
  goal: Choropleth 지도로 지역별 데이터를 시각화합니다.\r
  description: 단계구분도(Choropleth)는 지역별 수치를 색상 단계로 표현합니다. 인구, 소득, 투표율 등 통계 데이터를 지도에 시각화합니다. GeoJSON과 데이터를\r
    연결하여 자동으로 색상을 매핑합니다.\r
  direction: 단계구분도에서 위치 데이터를 지도 레이어로 배치하고 마커/영역 표시를 검증합니다.\r
  benefits:\r
  - 위도/경도 데이터 확인 후 지도 레이어 구성에 맞는 코드 입력을 고릅니다.\r
  - 단계구분도 결과를 마커와 저장 HTML 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 위치 기반 리포트에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 라이브러리 불러오기 입력 확인\r
      detail: 입력 기준(위도/경도 데이터)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. Choropleth 처리 실행\r
      detail: 지도 레이어 구성 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 간단한 Choropl 결과 검증\r
      detail: 마커와 저장 HTML 기준으로 실행 결과를 비교합니다.\r
    - label: 단계구분도 재사용\r
      detail: 완성 코드를 위치 기반 리포트에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 지도 시각화 환경\r
      detail: branca, folium 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 단계구분도 실행\r
      detail: 셀을 실행해 마커와 저장 HTML와 예외 상태를 확인합니다.\r
    - label: 단계구분도 완료\r
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
- id: step2_choropleth_basics\r
  title: 2단계. Choropleth 기본\r
  structuredPrimary: true\r
  subtitle: Choropleth()\r
  goal: 2단계. Choropleth 기본에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    Choropleth()는 GeoJSON과 데이터를 연결하여 색상을 자동 매핑합니다. key_on으로 GeoJSON 속성을, columns로 데이터 컬럼을 지정합니다.\r
\r
    GeoJSON의 properties에 있는 id와 데이터의 키를 매칭시킵니다.\r
  snippet: |-\r
    seoulCenter = [37.5665, 126.9780]\r
\r
    guGeo = {\r
        "type": "FeatureCollection",\r
        "features": [\r
            {\r
                "type": "Feature",\r
                "properties": {"id": "jongno", "name": "종로구"},\r
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
                "properties": {"id": "jung", "name": "중구"},\r
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
                "properties": {"id": "yongsan", "name": "용산구"},\r
                "geometry": {\r
                    "type": "Polygon",\r
                    "coordinates": [[\r
                        [126.96, 37.51], [127.00, 37.51],\r
                        [127.00, 37.54], [126.96, 37.54], [126.96, 37.51]\r
                    ]]\r
                }\r
            }\r
        ]\r
    }\r
\r
    guData = {\r
        "jongno": 150000,\r
        "jung": 130000,\r
        "yongsan": 230000\r
    }\r
    guData\r
  exercise:\r
    prompt: 2단계. Choropleth 기본 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      seoulCenter = [37.5665, 126.9780]\r
\r
      guGeo = {\r
          "type": "FeatureCollection",\r
          "features": [\r
              {\r
                  "type": "Feature",\r
                  "properties": {"id": "jongno", "name": "종로구"},\r
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
                  "properties": {"id": "jung", "name": "중구"},\r
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
                  "properties": {"id": "yongsan", "name": "용산구"},\r
                  "geometry": {\r
                      "type": "Polygon",\r
                      "coordinates": [[\r
                          [126.96, 37.51], [127.00, 37.51],\r
                          [127.00, 37.54], [126.96, 37.54], [126.96, 37.51]\r
                      ]]\r
                  }\r
              }\r
          ]\r
      }\r
\r
      guData = {\r
          "jongno": 150000,\r
          "jung": 130000,\r
          "yongsan": 230000\r
      }\r
      guData\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 2단계. Choropleth 기본에서 \`seoulCenter\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 2단계. Choropleth 기본 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step3_simple_choropleth\r
  title: 3단계. 간단한 Choropleth\r
  structuredPrimary: true\r
  subtitle: GeoJson + style_function\r
  goal: 3단계. 간단한 Choropleth에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: |-\r
    Choropleth 클래스 대신 GeoJson에 style_function을 사용하면 더 유연하게 구현할 수 있습니다.\r
\r
    getColor 함수에서 값에 따라 색상을 반환합니다. 임계값을 조절하여 구간을 설정합니다.\r
  snippet: |-\r
    m1 = folium.Map(location=[37.555, 126.98], zoom_start=12)\r
\r
    def getColor(value):\r
        if value >= 200000:\r
            return "#e74c3c"\r
        elif value >= 150000:\r
            return "#f39c12"\r
        else:\r
            return "#27ae60"\r
\r
    def choroplethStyle(feature):\r
        guId = feature["properties"]["id"]\r
        value = guData.get(guId, 0)\r
        return {\r
            "fillColor": getColor(value),\r
            "color": "white",\r
            "weight": 2,\r
            "fillOpacity": 0.7\r
        }\r
\r
    folium.GeoJson(\r
        guGeo,\r
        style_function=choroplethStyle,\r
        tooltip=folium.GeoJsonTooltip(fields=["name"])\r
    ).add_to(m1)\r
\r
    m1\r
  exercise:\r
    prompt: 3단계. 간단한 Choropleth 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      m1 = folium.Map(location=[37.555, 126.98], zoom_start=12)\r
\r
      def getColor(value):\r
          if value >= 200000:\r
              return "#e74c3c"\r
          elif value >= 150000:\r
              return "#f39c12"\r
          else:\r
              return "#27ae60"\r
\r
      def choroplethStyle(feature):\r
          guId = feature["properties"]["id"]\r
          value = guData.get(guId, 0)\r
          return {\r
              "fillColor": getColor(value),\r
              "color": "white",\r
              "weight": 2,\r
              "fillOpacity": 0.7\r
          }\r
\r
      folium.GeoJson(\r
          guGeo,\r
          style_function=choroplethStyle,\r
          tooltip=folium.GeoJsonTooltip(fields=["name"])\r
      ).add_to(m1)\r
\r
      m1\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    noError: 3단계. 간단한 Choropleth의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 3단계. 간단한 Choropleth 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: step4_color_scale\r
  title: 4단계. 컬러 스케일\r
  structuredPrimary: true\r
  subtitle: 연속적 색상\r
  goal: 4단계. 컬러 스케일에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: |-\r
    branca 라이브러리로 연속적인 컬러 스케일을 만들 수 있습니다. Folium에 포함되어 있습니다.\r
\r
    LinearColormap은 값에 따라 색상을 선형으로 보간합니다. 최소~최대 범위를 자동으로 매핑합니다.\r
  snippet: |-\r
    import branca.colormap as cm\r
\r
    m2 = folium.Map(location=[37.555, 126.98], zoom_start=12)\r
\r
    values = list(guData.values())\r
    minVal = min(values)\r
    maxVal = max(values)\r
\r
    colormap = cm.LinearColormap(\r
        colors=["green", "yellow", "red"],\r
        vmin=minVal,\r
        vmax=maxVal\r
    )\r
\r
    def scaleStyle(feature):\r
        guId = feature["properties"]["id"]\r
        value = guData.get(guId, minVal)\r
        return {\r
            "fillColor": colormap(value),\r
            "color": "black",\r
            "weight": 1,\r
            "fillOpacity": 0.7\r
        }\r
\r
    folium.GeoJson(\r
        guGeo,\r
        style_function=scaleStyle,\r
        tooltip=folium.GeoJsonTooltip(fields=["name"])\r
    ).add_to(m2)\r
\r
    m2\r
  exercise:\r
    prompt: 4단계. 컬러 스케일 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      import branca.colormap as cm\r
\r
      m2 = folium.Map(location=[37.555, 126.98], zoom_start=12)\r
\r
      values = list(guData.values())\r
      minVal = min(values)\r
      maxVal = max(values)\r
\r
      colormap = cm.LinearColormap(\r
          colors=["green", "yellow", "red"],\r
          vmin=minVal,\r
          vmax=maxVal\r
      )\r
\r
      def scaleStyle(feature):\r
          guId = feature["properties"]["id"]\r
          value = guData.get(guId, minVal)\r
          return {\r
              "fillColor": colormap(value),\r
              "color": "black",\r
              "weight": 1,\r
              "fillOpacity": 0.7\r
          }\r
\r
      folium.GeoJson(\r
          guGeo,\r
          style_function=scaleStyle,\r
          tooltip=folium.GeoJsonTooltip(fields=["name"])\r
      ).add_to(m2)\r
\r
      m2\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    noError: 4단계. 컬러 스케일의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 4단계. 컬러 스케일 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: step5_add_legend\r
  title: 5단계. 범례 추가\r
  structuredPrimary: true\r
  subtitle: ColorMap 범례\r
  goal: 5단계. 범례 추가에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: |-\r
    ColorMap에 caption을 추가하고 지도에 add_to()하면 범례가 표시됩니다.\r
\r
    caption은 범례 제목입니다. 범례는 지도 우측 하단에 표시됩니다.\r
  snippet: |-\r
    m3 = folium.Map(location=[37.555, 126.98], zoom_start=12)\r
\r
    legendColormap = cm.LinearColormap(\r
        colors=["#2ecc71", "#f1c40f", "#e74c3c"],\r
        vmin=100000,\r
        vmax=250000,\r
        caption="인구수"\r
    )\r
\r
    def legendStyle(feature):\r
        guId = feature["properties"]["id"]\r
        value = guData.get(guId, 100000)\r
        return {\r
            "fillColor": legendColormap(value),\r
            "color": "white",\r
            "weight": 2,\r
            "fillOpacity": 0.7\r
        }\r
\r
    folium.GeoJson(\r
        guGeo,\r
        style_function=legendStyle,\r
        tooltip=folium.GeoJsonTooltip(fields=["name"])\r
    ).add_to(m3)\r
\r
    legendColormap.add_to(m3)\r
\r
    m3\r
  exercise:\r
    prompt: 5단계. 범례 추가 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      m3 = folium.Map(location=[37.555, 126.98], zoom_start=12)\r
\r
      legendColormap = cm.LinearColormap(\r
          colors=["#2ecc71", "#f1c40f", "#e74c3c"],\r
          vmin=100000,\r
          vmax=250000,\r
          caption="인구수"\r
      )\r
\r
      def legendStyle(feature):\r
          guId = feature["properties"]["id"]\r
          value = guData.get(guId, 100000)\r
          return {\r
              "fillColor": legendColormap(value),\r
              "color": "white",\r
              "weight": 2,\r
              "fillOpacity": 0.7\r
          }\r
\r
      folium.GeoJson(\r
          guGeo,\r
          style_function=legendStyle,\r
          tooltip=folium.GeoJsonTooltip(fields=["name"])\r
      ).add_to(m3)\r
\r
      legendColormap.add_to(m3)\r
\r
      m3\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    noError: 5단계. 범례 추가의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 5단계. 범례 추가 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: step6_step_colormap\r
  title: 6단계. 단계별 컬러맵\r
  structuredPrimary: true\r
  subtitle: StepColormap\r
  goal: 6단계. 단계별 컬러맵에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: |-\r
    StepColormap은 구간별로 색상을 나눕니다. 연속이 아닌 이산적인 범주에 적합합니다.\r
\r
    index는 구간 경계값 리스트입니다. 4개 색상이면 3개 경계가 필요합니다.\r
  snippet: |-\r
    m4 = folium.Map(location=[37.555, 126.98], zoom_start=12)\r
\r
    stepColormap = cm.StepColormap(\r
        colors=["green", "yellow", "orange", "red"],\r
        index=[100000, 150000, 200000, 250000],\r
        vmin=100000,\r
        vmax=250000,\r
        caption="인구 구간"\r
    )\r
\r
    def stepStyle(feature):\r
        guId = feature["properties"]["id"]\r
        value = guData.get(guId, 100000)\r
        return {\r
            "fillColor": stepColormap(value),\r
            "color": "black",\r
            "weight": 1,\r
            "fillOpacity": 0.7\r
        }\r
\r
    folium.GeoJson(\r
        guGeo,\r
        style_function=stepStyle,\r
        tooltip=folium.GeoJsonTooltip(fields=["name"])\r
    ).add_to(m4)\r
\r
    stepColormap.add_to(m4)\r
\r
    m4\r
  exercise:\r
    prompt: 6단계. 단계별 컬러맵 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      m4 = folium.Map(location=[37.555, 126.98], zoom_start=12)\r
\r
      stepColormap = cm.StepColormap(\r
          colors=["green", "yellow", "orange", "red"],\r
          index=[100000, 150000, 200000, 250000],\r
          vmin=100000,\r
          vmax=250000,\r
          caption="인구 구간"\r
      )\r
\r
      def stepStyle(feature):\r
          guId = feature["properties"]["id"]\r
          value = guData.get(guId, 100000)\r
          return {\r
              "fillColor": stepColormap(value),\r
              "color": "black",\r
              "weight": 1,\r
              "fillOpacity": 0.7\r
          }\r
\r
      folium.GeoJson(\r
          guGeo,\r
          style_function=stepStyle,\r
          tooltip=folium.GeoJsonTooltip(fields=["name"])\r
      ).add_to(m4)\r
\r
      stepColormap.add_to(m4)\r
\r
      m4\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    noError: 6단계. 단계별 컬러맵의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 6단계. 단계별 컬러맵 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: step7_tooltip_with_value\r
  title: 7단계. 값 표시 툴팁\r
  structuredPrimary: true\r
  subtitle: 데이터 포함\r
  goal: 7단계. 값 표시 툴팁에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: |-\r
    툴팁에 지역명과 데이터 값을 함께 표시합니다.\r
\r
    GeoJSON properties에 직접 데이터를 넣으면 tooltip에서 바로 사용할 수 있습니다.\r
  snippet: |-\r
    m5 = folium.Map(location=[37.555, 126.98], zoom_start=12)\r
\r
    guGeoWithData = {\r
        "type": "FeatureCollection",\r
        "features": [\r
            {\r
                "type": "Feature",\r
                "properties": {"id": "jongno", "name": "종로구", "population": 150000},\r
                "geometry": guGeo["features"][0]["geometry"]\r
            },\r
            {\r
                "type": "Feature",\r
                "properties": {"id": "jung", "name": "중구", "population": 130000},\r
                "geometry": guGeo["features"][1]["geometry"]\r
            },\r
            {\r
                "type": "Feature",\r
                "properties": {"id": "yongsan", "name": "용산구", "population": 230000},\r
                "geometry": guGeo["features"][2]["geometry"]\r
            }\r
        ]\r
    }\r
\r
    valueColormap = cm.LinearColormap(\r
        colors=["lightblue", "blue", "darkblue"],\r
        vmin=100000,\r
        vmax=250000,\r
        caption="인구"\r
    )\r
\r
    def valueStyle(feature):\r
        pop = feature["properties"]["population"]\r
        return {\r
            "fillColor": valueColormap(pop),\r
            "color": "white",\r
            "weight": 2,\r
            "fillOpacity": 0.7\r
        }\r
\r
    folium.GeoJson(\r
        guGeoWithData,\r
        style_function=valueStyle,\r
        tooltip=folium.GeoJsonTooltip(\r
            fields=["name", "population"],\r
            aliases=["구:", "인구:"]\r
        )\r
    ).add_to(m5)\r
\r
    valueColormap.add_to(m5)\r
\r
    m5\r
  exercise:\r
    prompt: 7단계. 값 표시 툴팁 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      m5 = folium.Map(location=[37.555, 126.98], zoom_start=12)\r
\r
      guGeoWithData = {\r
          "type": "FeatureCollection",\r
          "features": [\r
              {\r
                  "type": "Feature",\r
                  "properties": {"id": "jongno", "name": "종로구", "population": 150000},\r
                  "geometry": guGeo["features"][0]["geometry"]\r
              },\r
              {\r
                  "type": "Feature",\r
                  "properties": {"id": "jung", "name": "중구", "population": 130000},\r
                  "geometry": guGeo["features"][1]["geometry"]\r
              },\r
              {\r
                  "type": "Feature",\r
                  "properties": {"id": "yongsan", "name": "용산구", "population": 230000},\r
                  "geometry": guGeo["features"][2]["geometry"]\r
              }\r
          ]\r
      }\r
\r
      valueColormap = cm.LinearColormap(\r
          colors=["lightblue", "blue", "darkblue"],\r
          vmin=100000,\r
          vmax=250000,\r
          caption="인구"\r
      )\r
\r
      def valueStyle(feature):\r
          pop = feature["properties"]["population"]\r
          return {\r
              "fillColor": valueColormap(pop),\r
              "color": "white",\r
              "weight": 2,\r
              "fillOpacity": 0.7\r
          }\r
\r
      folium.GeoJson(\r
          guGeoWithData,\r
          style_function=valueStyle,\r
          tooltip=folium.GeoJsonTooltip(\r
              fields=["name", "population"],\r
              aliases=["구:", "인구:"]\r
          )\r
      ).add_to(m5)\r
\r
      valueColormap.add_to(m5)\r
\r
      m5\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    noError: 7단계. 값 표시 툴팁의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 7단계. 값 표시 툴팁 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: step8_highlight\r
  title: 8단계. 하이라이트 효과\r
  structuredPrimary: true\r
  subtitle: 인터랙션 추가\r
  goal: 8단계. 하이라이트 효과에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: |-\r
    highlight_function으로 마우스 호버 시 강조 효과를 추가합니다.\r
\r
    하이라이트로 사용자가 어느 지역을 보고 있는지 명확하게 알 수 있습니다.\r
  snippet: |-\r
    m6 = folium.Map(location=[37.555, 126.98], zoom_start=12)\r
\r
    hoverColormap = cm.LinearColormap(\r
        colors=["#ecf0f1", "#3498db", "#2c3e50"],\r
        vmin=100000,\r
        vmax=250000,\r
        caption="인구"\r
    )\r
\r
    def hoverNormalStyle(feature):\r
        pop = feature["properties"]["population"]\r
        return {\r
            "fillColor": hoverColormap(pop),\r
            "color": "white",\r
            "weight": 1,\r
            "fillOpacity": 0.7\r
        }\r
\r
    def hoverHighlightStyle(feature):\r
        return {\r
            "fillColor": "#f1c40f",\r
            "color": "black",\r
            "weight": 3,\r
            "fillOpacity": 0.9\r
        }\r
\r
    folium.GeoJson(\r
        guGeoWithData,\r
        style_function=hoverNormalStyle,\r
        highlight_function=hoverHighlightStyle,\r
        tooltip=folium.GeoJsonTooltip(\r
            fields=["name", "population"],\r
            aliases=["구:", "인구:"],\r
            style="font-size: 14px; font-weight: bold;"\r
        )\r
    ).add_to(m6)\r
\r
    hoverColormap.add_to(m6)\r
\r
    m6\r
  exercise:\r
    prompt: 8단계. 하이라이트 효과 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      m6 = folium.Map(location=[37.555, 126.98], zoom_start=12)\r
\r
      hoverColormap = cm.LinearColormap(\r
          colors=["#ecf0f1", "#3498db", "#2c3e50"],\r
          vmin=100000,\r
          vmax=250000,\r
          caption="인구"\r
      )\r
\r
      def hoverNormalStyle(feature):\r
          pop = feature["properties"]["population"]\r
          return {\r
              "fillColor": hoverColormap(pop),\r
              "color": "white",\r
              "weight": 1,\r
              "fillOpacity": 0.7\r
          }\r
\r
      def hoverHighlightStyle(feature):\r
          return {\r
              "fillColor": "#f1c40f",\r
              "color": "black",\r
              "weight": 3,\r
              "fillOpacity": 0.9\r
          }\r
\r
      folium.GeoJson(\r
          guGeoWithData,\r
          style_function=hoverNormalStyle,\r
          highlight_function=hoverHighlightStyle,\r
          tooltip=folium.GeoJsonTooltip(\r
              fields=["name", "population"],\r
              aliases=["구:", "인구:"],\r
              style="font-size: 14px; font-weight: bold;"\r
          )\r
      ).add_to(m6)\r
\r
      hoverColormap.add_to(m6)\r
\r
      m6\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    noError: 8단계. 하이라이트 효과의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 8단계. 하이라이트 효과 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: step9_multi_data\r
  title: 9단계. 다중 데이터 시각화\r
  structuredPrimary: true\r
  subtitle: 레이어 전환\r
  goal: 9단계. 다중 데이터 시각화에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    여러 종류의 데이터를 레이어로 구분하고 전환할 수 있게 합니다.\r
\r
    LayerControl로 인구/면적 레이어를 전환할 수 있습니다.\r
  snippet: |-\r
    m7 = folium.Map(location=[37.555, 126.98], zoom_start=12)\r
\r
    multiGeo = {\r
        "type": "FeatureCollection",\r
        "features": [\r
            {\r
                "type": "Feature",\r
                "properties": {"name": "종로구", "population": 150000, "area": 23.9},\r
                "geometry": guGeo["features"][0]["geometry"]\r
            },\r
            {\r
                "type": "Feature",\r
                "properties": {"name": "중구", "population": 130000, "area": 9.96},\r
                "geometry": guGeo["features"][1]["geometry"]\r
            },\r
            {\r
                "type": "Feature",\r
                "properties": {"name": "용산구", "population": 230000, "area": 21.87},\r
                "geometry": guGeo["features"][2]["geometry"]\r
            }\r
        ]\r
    }\r
\r
    popColormap = cm.LinearColormap(\r
        colors=["lightgreen", "darkgreen"],\r
        vmin=100000,\r
        vmax=250000\r
    )\r
\r
    areaColormap = cm.LinearColormap(\r
        colors=["lightyellow", "darkorange"],\r
        vmin=5,\r
        vmax=30\r
    )\r
\r
    popGroup = folium.FeatureGroup(name="인구")\r
    areaGroup = folium.FeatureGroup(name="면적", show=False)\r
\r
    folium.GeoJson(\r
        multiGeo,\r
        style_function=lambda f: {\r
            "fillColor": popColormap(f["properties"]["population"]),\r
            "color": "white", "weight": 2, "fillOpacity": 0.7\r
        },\r
        tooltip=folium.GeoJsonTooltip(fields=["name", "population"])\r
    ).add_to(popGroup)\r
\r
    folium.GeoJson(\r
        multiGeo,\r
        style_function=lambda f: {\r
            "fillColor": areaColormap(f["properties"]["area"]),\r
            "color": "white", "weight": 2, "fillOpacity": 0.7\r
        },\r
        tooltip=folium.GeoJsonTooltip(fields=["name", "area"])\r
    ).add_to(areaGroup)\r
\r
    popGroup.add_to(m7)\r
    areaGroup.add_to(m7)\r
\r
    folium.LayerControl().add_to(m7)\r
\r
    m7\r
  exercise:\r
    prompt: 9단계. 다중 데이터 시각화 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      m7 = folium.Map(location=[37.555, 126.98], zoom_start=12)\r
\r
      multiGeo = {\r
          "type": "FeatureCollection",\r
          "features": [\r
              {\r
                  "type": "Feature",\r
                  "properties": {"name": "종로구", "population": 150000, "area": 23.9},\r
                  "geometry": guGeo["features"][0]["geometry"]\r
              },\r
              {\r
                  "type": "Feature",\r
                  "properties": {"name": "중구", "population": 130000, "area": 9.96},\r
                  "geometry": guGeo["features"][1]["geometry"]\r
              },\r
              {\r
                  "type": "Feature",\r
                  "properties": {"name": "용산구", "population": 230000, "area": 21.87},\r
                  "geometry": guGeo["features"][2]["geometry"]\r
              }\r
          ]\r
      }\r
\r
      popColormap = cm.LinearColormap(\r
          colors=["lightgreen", "darkgreen"],\r
          vmin=100000,\r
          vmax=250000\r
      )\r
\r
      areaColormap = cm.LinearColormap(\r
          colors=["lightyellow", "darkorange"],\r
          vmin=5,\r
          vmax=30\r
      )\r
\r
      popGroup = folium.FeatureGroup(name="인구")\r
      areaGroup = folium.FeatureGroup(name="면적", show=False)\r
\r
      folium.GeoJson(\r
          multiGeo,\r
          style_function=lambda f: {\r
              "fillColor": popColormap(f["properties"]["population"]),\r
              "color": "white", "weight": 2, "fillOpacity": 0.7\r
          },\r
          tooltip=folium.GeoJsonTooltip(fields=["name", "population"])\r
      ).add_to(popGroup)\r
\r
      folium.GeoJson(\r
          multiGeo,\r
          style_function=lambda f: {\r
              "fillColor": areaColormap(f["properties"]["area"]),\r
              "color": "white", "weight": 2, "fillOpacity": 0.7\r
          },\r
          tooltip=folium.GeoJsonTooltip(fields=["name", "area"])\r
      ).add_to(areaGroup)\r
\r
      popGroup.add_to(m7)\r
      areaGroup.add_to(m7)\r
\r
      folium.LayerControl().add_to(m7)\r
\r
      m7\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 9단계. 다중 데이터 시각화에서 \`m7\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 9단계. 다중 데이터 시각화 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step10_complete\r
  title: 10단계. 완성 예제\r
  structuredPrimary: true\r
  subtitle: 지역 통계 지도\r
  goal: 10단계. 완성 예제에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: 완성된 단계구분도를 만듭니다. 컬러맵, 범례, 툴팁, 하이라이트를 모두 포함합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    statMap = folium.Map(\r
        location=[37.555, 126.98],\r
        zoom_start=12,\r
        tiles="CartoDB Positron"\r
    )\r
\r
    statsGeo = {\r
        "type": "FeatureCollection",\r
        "features": [\r
            {\r
                "type": "Feature",\r
                "properties": {"name": "종로구", "value": 85, "category": "상"},\r
                "geometry": guGeo["features"][0]["geometry"]\r
            },\r
            {\r
                "type": "Feature",\r
                "properties": {"name": "중구", "value": 72, "category": "중"},\r
                "geometry": guGeo["features"][1]["geometry"]\r
            },\r
            {\r
                "type": "Feature",\r
                "properties": {"name": "용산구", "value": 91, "category": "상"},\r
                "geometry": guGeo["features"][2]["geometry"]\r
            }\r
        ]\r
    }\r
\r
    finalColormap = cm.StepColormap(\r
        colors=["#fee8c8", "#fdbb84", "#e34a33"],\r
        index=[60, 75, 90, 100],\r
        vmin=60,\r
        vmax=100,\r
        caption="만족도 점수"\r
    )\r
\r
    def finalStyle(feature):\r
        val = feature["properties"]["value"]\r
        return {\r
            "fillColor": finalColormap(val),\r
            "color": "#333",\r
            "weight": 2,\r
            "fillOpacity": 0.8\r
        }\r
\r
    def finalHighlight(feature):\r
        return {\r
            "fillColor": "#2ecc71",\r
            "color": "black",\r
            "weight": 3,\r
            "fillOpacity": 0.9\r
        }\r
\r
    folium.GeoJson(\r
        statsGeo,\r
        style_function=finalStyle,\r
        highlight_function=finalHighlight,\r
        tooltip=folium.GeoJsonTooltip(\r
            fields=["name", "value", "category"],\r
            aliases=["구:", "점수:", "등급:"],\r
            style="background-color: white; padding: 5px;"\r
        ),\r
        popup=folium.GeoJsonPopup(\r
            fields=["name", "value"],\r
            aliases=["지역:", "만족도:"]\r
        )\r
    ).add_to(statMap)\r
\r
    finalColormap.add_to(statMap)\r
\r
    statMap\r
  exercise:\r
    prompt: 10단계. 완성 예제 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      statMap = folium.Map(\r
          location=[37.555, 126.98],\r
          zoom_start=12,\r
          tiles="CartoDB Positron"\r
      )\r
\r
      statsGeo = {\r
          "type": "FeatureCollection",\r
          "features": [\r
              {\r
                  "type": "Feature",\r
                  "properties": {"name": "종로구", "value": 85, "category": "상"},\r
                  "geometry": guGeo["features"][0]["geometry"]\r
              },\r
              {\r
                  "type": "Feature",\r
                  "properties": {"name": "중구", "value": 72, "category": "중"},\r
                  "geometry": guGeo["features"][1]["geometry"]\r
              },\r
              {\r
                  "type": "Feature",\r
                  "properties": {"name": "용산구", "value": 91, "category": "상"},\r
                  "geometry": guGeo["features"][2]["geometry"]\r
              }\r
          ]\r
      }\r
\r
      finalColormap = cm.StepColormap(\r
          colors=["#fee8c8", "#fdbb84", "#e34a33"],\r
          index=[60, 75, 90, 100],\r
          vmin=60,\r
          vmax=100,\r
          caption="만족도 점수"\r
      )\r
\r
      def finalStyle(feature):\r
          val = feature["properties"]["value"]\r
          return {\r
              "fillColor": finalColormap(val),\r
              "color": "#333",\r
              "weight": 2,\r
              "fillOpacity": 0.8\r
          }\r
\r
      def finalHighlight(feature):\r
          return {\r
              "fillColor": "#2ecc71",\r
              "color": "black",\r
              "weight": 3,\r
              "fillOpacity": 0.9\r
          }\r
\r
      folium.GeoJson(\r
          statsGeo,\r
          style_function=finalStyle,\r
          highlight_function=finalHighlight,\r
          tooltip=folium.GeoJsonTooltip(\r
              fields=["name", "value", "category"],\r
              aliases=["구:", "점수:", "등급:"],\r
              style="background-color: white; padding: 5px;"\r
          ),\r
          popup=folium.GeoJsonPopup(\r
              fields=["name", "value"],\r
              aliases=["지역:", "만족도:"]\r
          )\r
      ).add_to(statMap)\r
\r
      finalColormap.add_to(statMap)\r
\r
      statMap\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    noError: 10단계. 완성 예제의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 10단계. 완성 예제 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: step11_workflow\r
  title: 11단계. 단계구분도 검증 루프\r
  structuredPrimary: true\r
  subtitle: 지역 키 매칭과 구간 해석\r
  goal: 11단계. 단계구분도 검증 루프에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.\r
  explanation: |-\r
    단계구분도는 색이 칠해진다고 끝이 아닙니다. GeoJSON의 지역 키와 데이터 키가 정확히 맞는지, 임계값을 바꾸면 어떤 지역의 등급이 달라지는지 예측하고 검증해야 실무 리포트로 쓸 수 있습니다.\r
\r
    단계구분도는 색상보다 키 매칭과 기준선 검증이 먼저입니다. 데이터-경계 불일치를 잡고 임계값 실험을 거쳐야 의사결정용 지도가 됩니다.\r
  snippet: |-\r
    serviceGeo = {\r
        "type": "FeatureCollection",\r
        "features": [\r
            {\r
                "type": "Feature",\r
                "properties": {"id": "north", "name": "북구"},\r
                "geometry": {"type": "Polygon", "coordinates": [[[126.94, 37.58], [126.99, 37.58], [126.99, 37.62], [126.94, 37.62], [126.94, 37.58]]]},\r
            },\r
            {\r
                "type": "Feature",\r
                "properties": {"id": "central", "name": "중앙구"},\r
                "geometry": {"type": "Polygon", "coordinates": [[[126.94, 37.54], [126.99, 37.54], [126.99, 37.58], [126.94, 37.58], [126.94, 37.54]]]},\r
            },\r
            {\r
                "type": "Feature",\r
                "properties": {"id": "south", "name": "남구"},\r
                "geometry": {"type": "Polygon", "coordinates": [[[126.94, 37.50], [126.99, 37.50], [126.99, 37.54], [126.94, 37.54], [126.94, 37.50]]]},\r
            },\r
        ],\r
    }\r
\r
    serviceData = {\r
        "north": {"complaints": 180, "population": 120000},\r
        "central": {"complaints": 260, "population": 90000},\r
        "south": {"complaints": 130, "population": 110000},\r
    }\r
\r
    complaintDensity = {\r
        regionId: round(values["complaints"] / values["population"] * 10000, 1)\r
        for regionId, values in serviceData.items()\r
    }\r
    complaintDensity\r
  exercise:\r
    prompt: 11단계. 단계구분도 검증 루프 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.\r
    starterCode: |-\r
      serviceGeo = {\r
          "type": "FeatureCollection",\r
          "features": [\r
              {\r
                  "type": "Feature",\r
                  "properties": {"id": "north", "name": "북구"},\r
                  "geometry": {"type": "Polygon", "coordinates": [[[126.94, 37.58], [126.99, 37.58], [126.99, 37.62], [126.94, 37.62], [126.94, 37.58]]]},\r
              },\r
              {\r
                  "type": "Feature",\r
                  "properties": {"id": "central", "name": "중앙구"},\r
                  "geometry": {"type": "Polygon", "coordinates": [[[126.94, 37.54], [126.99, 37.54], [126.99, 37.58], [126.94, 37.58], [126.94, 37.54]]]},\r
              },\r
              {\r
                  "type": "Feature",\r
                  "properties": {"id": "south", "name": "남구"},\r
                  "geometry": {"type": "Polygon", "coordinates": [[[126.94, 37.50], [126.99, 37.50], [126.99, 37.54], [126.94, 37.54], [126.94, 37.50]]]},\r
              },\r
          ],\r
      }\r
\r
      serviceData = {\r
          "north": {"complaints": 180, "population": 120000},\r
          "central": {"complaints": 260, "population": 90000},\r
          "south": {"complaints": 130, "population": 110000},\r
      }\r
\r
      complaintDensity = {\r
          regionId: round(values["complaints"] / values["population"] * 10000, 1)\r
          for regionId, values in serviceData.items()\r
      }\r
      complaintDensity\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 11단계. 단계구분도 검증 루프의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 11단계. 단계구분도 검증 루프 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 단계구분도\r
  goal: 실습에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 지금까지 배운 내용을 활용하여 미션을 수행해봅시다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import folium\r
    import branca.colormap as cm\r
    salesGeo = {\r
        "type": "FeatureCollection",\r
        "features": [\r
            {\r
                "type": "Feature",\r
                "properties": {"region": "북부", "sales": 1200},\r
                "geometry": {"type": "Polygon", "coordinates": [[\r
                    [126.96, 37.57], [127.00, 37.57],\r
                    [127.00, 37.60], [126.96, 37.60], [126.96, 37.57]\r
                ]]}\r
            },\r
            {\r
                "type": "Feature",\r
                "properties": {"region": "중부", "sales": 800},\r
                "geometry": {"type": "Polygon", "coordinates": [[\r
                    [126.96, 37.54], [127.00, 37.54],\r
                    [127.00, 37.57], [126.96, 37.57], [126.96, 37.54]\r
                ]]}\r
            },\r
            {\r
                "type": "Feature",\r
                "properties": {"region": "남부", "sales": 1500},\r
                "geometry": {"type": "Polygon", "coordinates": [[\r
                    [126.96, 37.51], [127.00, 37.51],\r
                    [127.00, 37.54], [126.96, 37.54], [126.96, 37.51]\r
                ]]}\r
            }\r
        ]\r
    }\r
    salesGeo\r
  exercise:\r
    prompt: 실습 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      import folium\r
      import branca.colormap as cm\r
      salesGeo = {\r
          "type": "FeatureCollection",\r
          "features": [\r
              {\r
                  "type": "Feature",\r
                  "properties": {"region": "북부", "sales": 1200},\r
                  "geometry": {"type": "Polygon", "coordinates": [[\r
                      [126.96, 37.57], [127.00, 37.57],\r
                      [127.00, 37.60], [126.96, 37.60], [126.96, 37.57]\r
                  ]]}\r
              },\r
              {\r
                  "type": "Feature",\r
                  "properties": {"region": "중부", "sales": 800},\r
                  "geometry": {"type": "Polygon", "coordinates": [[\r
                      [126.96, 37.54], [127.00, 37.54],\r
                      [127.00, 37.57], [126.96, 37.57], [126.96, 37.54]\r
                  ]]}\r
              },\r
              {\r
                  "type": "Feature",\r
                  "properties": {"region": "남부", "sales": 1500},\r
                  "geometry": {"type": "Polygon", "coordinates": [[\r
                      [126.96, 37.51], [127.00, 37.51],\r
                      [127.00, 37.54], [126.96, 37.54], [126.96, 37.51]\r
                  ]]}\r
              }\r
          ]\r
      }\r
      salesGeo\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 실습에서 \`salesGeo\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 실습 실행 뒤 \`salesGeo\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.\r
`;export{e as default};