var e=`meta:\r
  packages:\r
  - folium\r
  id: folium_03\r
  title: 도형 그리기\r
  order: 3\r
  category: folium\r
  difficulty: ⭐⭐\r
  badge: 기초\r
  tags:\r
  - folium\r
  - Circle\r
  - Rectangle\r
  - PolyLine\r
  - Polygon\r
  - 도형\r
  seo:\r
    title: Folium 도형 그리기 - 원, 사각형, 경로 표시\r
    description: Folium으로 원, 사각형, 폴리라인, 폴리곤을 그립니다. 영역과 경로를 지도에 표시합니다.\r
    keywords:\r
    - folium\r
    - Circle\r
    - Rectangle\r
    - PolyLine\r
    - Polygon\r
    - 지도\r
    - 도형\r
intro:\r
  emoji: 🔷\r
  goal: 지도에 원, 사각형, 경로, 다각형을 그립니다.\r
  description: Folium으로 다양한 도형을 지도에 그립니다. Circle()과 CircleMarker()로 원을 그리고, Rectangle()로 사각형 영역을 표시합니다.\r
    PolyLine()으로 경로를, Polygon()으로 다각형 영역을 표현합니다.\r
  direction: 도형 그리기에서 위치 데이터를 지도 레이어로 배치하고 마커/영역 표시를 검증합니다.\r
  benefits:\r
  - 위도/경도 데이터 확인 후 지도 레이어 구성에 맞는 코드 입력을 고릅니다.\r
  - 도형 그리기 결과를 마커와 저장 HTML 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 위치 기반 리포트에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 라이브러리 불러오기 입력 확인\r
      detail: 입력 기준(위도/경도 데이터)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. Circle 그리기 처리 실행\r
      detail: 지도 레이어 구성 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. CircleMarke 결과 검증\r
      detail: 마커와 저장 HTML 기준으로 실행 결과를 비교합니다.\r
    - label: 도형 그리기 재사용\r
      detail: 완성 코드를 위치 기반 리포트에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 지도 시각화 환경\r
      detail: folium 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 도형 그리기 실행\r
      detail: 셀을 실행해 마커와 저장 HTML와 예외 상태를 확인합니다.\r
    - label: 도형 그리기 완료\r
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
- id: step2_circle\r
  title: 2단계. Circle 그리기\r
  structuredPrimary: true\r
  subtitle: Circle()\r
  goal: 2단계. Circle 그리기에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    Circle()은 실제 거리(미터) 기준으로 원을 그립니다. radius는 미터 단위입니다.\r
\r
    Circle의 radius는 미터 단위입니다. 500이면 반경 500m입니다. 줌 레벨을 바꿔도 실제 크기는 동일합니다.\r
  snippet: |-\r
    seoulCenter = [37.5665, 126.9780]\r
    m1 = folium.Map(location=seoulCenter, zoom_start=14)\r
\r
    folium.Circle(\r
        location=seoulCenter,\r
        radius=500,\r
        color="blue",\r
        fill=True,\r
        fill_opacity=0.3\r
    ).add_to(m1)\r
\r
    m1\r
  exercise:\r
    prompt: 2단계. Circle 그리기 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      seoulCenter = [37.5665, 126.9780]\r
      m1 = folium.Map(location=seoulCenter, zoom_start=14)\r
\r
      folium.Circle(\r
          location=seoulCenter,\r
          radius=500,\r
          color="blue",\r
          fill=True,\r
          fill_opacity=0.3\r
      ).add_to(m1)\r
\r
      m1\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 2단계. Circle 그리기에서 \`seoulCenter\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 2단계. Circle 그리기 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step3_circle_marker\r
  title: 3단계. CircleMarker 그리기\r
  structuredPrimary: true\r
  subtitle: CircleMarker()\r
  goal: 3단계. CircleMarker 그리기에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    CircleMarker()는 픽셀 기준으로 원을 그립니다. 줌 레벨이 바뀌어도 화면상 크기가 동일합니다.\r
\r
    Circle은 실제 영역 표시(반경 1km 배달 범위)에, CircleMarker는 데이터 포인트 크기 표시(인구수 비례)에 적합합니다.\r
  snippet: |-\r
    m2 = folium.Map(location=seoulCenter, zoom_start=14)\r
\r
    folium.CircleMarker(\r
        location=seoulCenter,\r
        radius=30,\r
        color="red",\r
        fill=True,\r
        fill_color="red",\r
        fill_opacity=0.5,\r
        popup="시청"\r
    ).add_to(m2)\r
\r
    m2\r
  exercise:\r
    prompt: 3단계. CircleMarker 그리기 예제에서 \`m2\`, \`location\`, \`radius\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      m2 = folium.Map(location=seoulCenter, zoom_start=14)\r
\r
      folium.CircleMarker(\r
          location=seoulCenter,\r
          radius=30,\r
          color="red",\r
          fill=True,\r
          fill_color="red",\r
          fill_opacity=0.5,\r
          popup="시청"\r
      ).add_to(m2)\r
\r
      m2\r
    hints:\r
    - 바꿀 지점은 \`m2 = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`m2\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    noError: 3단계. CircleMarker 그리기에서 \`m2\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 3단계. CircleMarker 그리기 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step4_circle_style\r
  title: 4단계. 원 스타일링\r
  structuredPrimary: true\r
  subtitle: color, fill, weight\r
  goal: 4단계. 원 스타일링에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    원의 외곽선과 채우기 색상, 투명도, 두께를 설정합니다.\r
\r
    weight는 외곽선 두께(픽셀)입니다. fill=False면 테두리만 그립니다.\r
  snippet: |-\r
    m4 = folium.Map(location=seoulCenter, zoom_start=13)\r
\r
    folium.Circle(\r
        location=[37.5665, 126.9700],\r
        radius=400,\r
        color="green",\r
        weight=2,\r
        fill=True,\r
        fill_color="lightgreen",\r
        fill_opacity=0.4,\r
        popup="녹지 영역"\r
    ).add_to(m4)\r
\r
    folium.Circle(\r
        location=[37.5665, 126.9860],\r
        radius=300,\r
        color="red",\r
        weight=5,\r
        fill=False,\r
        popup="경계만 표시"\r
    ).add_to(m4)\r
\r
    m4\r
  exercise:\r
    prompt: 4단계. 원 스타일링 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      m4 = folium.Map(location=seoulCenter, zoom_start=13)\r
\r
      folium.Circle(\r
          location=[37.5665, 126.9700],\r
          radius=400,\r
          color="green",\r
          weight=2,\r
          fill=True,\r
          fill_color="lightgreen",\r
          fill_opacity=0.4,\r
          popup="녹지 영역"\r
      ).add_to(m4)\r
\r
      folium.Circle(\r
          location=[37.5665, 126.9860],\r
          radius=300,\r
          color="red",\r
          weight=5,\r
          fill=False,\r
          popup="경계만 표시"\r
      ).add_to(m4)\r
\r
      m4\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 4단계. 원 스타일링에서 \`m4\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 4단계. 원 스타일링 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step5_rectangle\r
  title: 5단계. Rectangle 그리기\r
  structuredPrimary: true\r
  subtitle: Rectangle()\r
  goal: 5단계. Rectangle 그리기에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    Rectangle()은 두 모서리 좌표로 사각형을 그립니다. bounds에 [[남서], [북동]] 좌표를 전달합니다.\r
\r
    bounds는 [[남서쪽 위도, 경도], [북동쪽 위도, 경도]] 순서입니다. 좌하단과 우상단 좌표입니다.\r
  snippet: |-\r
    m5 = folium.Map(location=[37.5725, 126.9768], zoom_start=16)\r
\r
    bounds = [[37.5700, 126.9755], [37.5750, 126.9785]]\r
\r
    folium.Rectangle(\r
        bounds=bounds,\r
        color="purple",\r
        weight=3,\r
        fill=True,\r
        fill_color="purple",\r
        fill_opacity=0.2,\r
        popup="광화문 광장"\r
    ).add_to(m5)\r
\r
    m5\r
  exercise:\r
    prompt: 5단계. Rectangle 그리기 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      m5 = folium.Map(location=[37.5725, 126.9768], zoom_start=16)\r
\r
      bounds = [[37.5700, 126.9755], [37.5750, 126.9785]]\r
\r
      folium.Rectangle(\r
          bounds=bounds,\r
          color="purple",\r
          weight=3,\r
          fill=True,\r
          fill_color="purple",\r
          fill_opacity=0.2,\r
          popup="광화문 광장"\r
      ).add_to(m5)\r
\r
      m5\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 5단계. Rectangle 그리기에서 \`m5\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 5단계. Rectangle 그리기 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step6_polyline\r
  title: 6단계. PolyLine 그리기\r
  structuredPrimary: true\r
  subtitle: PolyLine()\r
  goal: 6단계. PolyLine 그리기에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    PolyLine()은 좌표 리스트를 연결한 선을 그립니다. 경로, 도로, 노선 표시에 사용합니다.\r
\r
    locations는 [위도, 경도] 좌표의 리스트입니다. 순서대로 선이 연결됩니다.\r
  snippet: |-\r
    m7 = folium.Map(location=[37.5283, 126.9340], zoom_start=14)\r
\r
    walkRoute = [\r
        [37.5283, 126.9240],\r
        [37.5300, 126.9300],\r
        [37.5320, 126.9350],\r
        [37.5310, 126.9400],\r
        [37.5280, 126.9440]\r
    ]\r
\r
    folium.PolyLine(\r
        locations=walkRoute,\r
        color="blue",\r
        weight=4,\r
        opacity=0.8,\r
        popup="한강 산책로"\r
    ).add_to(m7)\r
\r
    m7\r
  exercise:\r
    prompt: 6단계. PolyLine 그리기 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      m7 = folium.Map(location=[37.5283, 126.9340], zoom_start=14)\r
\r
      walkRoute = [\r
          [37.5283, 126.9240],\r
          [37.5300, 126.9300],\r
          [37.5320, 126.9350],\r
          [37.5310, 126.9400],\r
          [37.5280, 126.9440]\r
      ]\r
\r
      folium.PolyLine(\r
          locations=walkRoute,\r
          color="blue",\r
          weight=4,\r
          opacity=0.8,\r
          popup="한강 산책로"\r
      ).add_to(m7)\r
\r
      m7\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 6단계. PolyLine 그리기에서 \`m7\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 6단계. PolyLine 그리기 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step7_polyline_style\r
  title: 7단계. PolyLine 스타일\r
  structuredPrimary: true\r
  subtitle: dash_array, weight\r
  goal: 7단계. PolyLine 스타일에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    선의 스타일을 다양하게 변경합니다. dash_array로 점선을 만들 수 있습니다.\r
\r
    dash_array="10"은 10픽셀 선, 10픽셀 공백입니다. "10, 20"은 10픽셀 선, 20픽셀 공백입니다.\r
  snippet: |-\r
    m9 = folium.Map(location=seoulCenter, zoom_start=13)\r
\r
    route1 = [[37.5665, 126.9680], [37.5700, 126.9780], [37.5665, 126.9880]]\r
    route2 = [[37.5600, 126.9680], [37.5635, 126.9780], [37.5600, 126.9880]]\r
    route3 = [[37.5535, 126.9680], [37.5570, 126.9780], [37.5535, 126.9880]]\r
\r
    folium.PolyLine(\r
        locations=route1,\r
        color="blue",\r
        weight=4,\r
        popup="실선"\r
    ).add_to(m9)\r
\r
    folium.PolyLine(\r
        locations=route2,\r
        color="red",\r
        weight=4,\r
        dash_array="10",\r
        popup="점선"\r
    ).add_to(m9)\r
\r
    folium.PolyLine(\r
        locations=route3,\r
        color="green",\r
        weight=4,\r
        dash_array="10, 20",\r
        popup="긴 점선"\r
    ).add_to(m9)\r
\r
    m9\r
  exercise:\r
    prompt: 7단계. PolyLine 스타일 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      m9 = folium.Map(location=seoulCenter, zoom_start=13)\r
\r
      route1 = [[37.5665, 126.9680], [37.5700, 126.9780], [37.5665, 126.9880]]\r
      route2 = [[37.5600, 126.9680], [37.5635, 126.9780], [37.5600, 126.9880]]\r
      route3 = [[37.5535, 126.9680], [37.5570, 126.9780], [37.5535, 126.9880]]\r
\r
      folium.PolyLine(\r
          locations=route1,\r
          color="blue",\r
          weight=4,\r
          popup="실선"\r
      ).add_to(m9)\r
\r
      folium.PolyLine(\r
          locations=route2,\r
          color="red",\r
          weight=4,\r
          dash_array="10",\r
          popup="점선"\r
      ).add_to(m9)\r
\r
      folium.PolyLine(\r
          locations=route3,\r
          color="green",\r
          weight=4,\r
          dash_array="10, 20",\r
          popup="긴 점선"\r
      ).add_to(m9)\r
\r
      m9\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 7단계. PolyLine 스타일에서 \`m9\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 7단계. PolyLine 스타일 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step8_polygon\r
  title: 8단계. Polygon 그리기\r
  structuredPrimary: true\r
  subtitle: Polygon()\r
  goal: 8단계. Polygon 그리기에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    Polygon()은 좌표 리스트로 닫힌 다각형을 그립니다. 시작점과 끝점이 자동으로 연결됩니다.\r
\r
    Polygon은 자동으로 첫 점과 마지막 점을 연결합니다. PolyLine처럼 열린 선이 아닙니다.\r
  snippet: |-\r
    m10 = folium.Map(location=seoulCenter, zoom_start=14)\r
\r
    triangle = [\r
        [37.5700, 126.9780],\r
        [37.5630, 126.9700],\r
        [37.5630, 126.9860]\r
    ]\r
\r
    folium.Polygon(\r
        locations=triangle,\r
        color="orange",\r
        weight=3,\r
        fill=True,\r
        fill_color="orange",\r
        fill_opacity=0.4,\r
        popup="삼각 구역"\r
    ).add_to(m10)\r
\r
    m10\r
  exercise:\r
    prompt: 8단계. Polygon 그리기 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      m10 = folium.Map(location=seoulCenter, zoom_start=14)\r
\r
      triangle = [\r
          [37.5700, 126.9780],\r
          [37.5630, 126.9700],\r
          [37.5630, 126.9860]\r
      ]\r
\r
      folium.Polygon(\r
          locations=triangle,\r
          color="orange",\r
          weight=3,\r
          fill=True,\r
          fill_color="orange",\r
          fill_opacity=0.4,\r
          popup="삼각 구역"\r
      ).add_to(m10)\r
\r
      m10\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 8단계. Polygon 그리기에서 \`m10\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 8단계. Polygon 그리기 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step9_multiple_shapes\r
  title: 9단계. 여러 도형 조합\r
  structuredPrimary: true\r
  subtitle: 도형 혼합 사용\r
  goal: 9단계. 여러 도형 조합에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    원, 사각형, 선, 다각형을 조합하여 복잡한 지도를 만듭니다.\r
\r
    여러 도형을 겹쳐 그릴 때 투명도를 적절히 조절하세요. fill_opacity가 너무 높으면 겹친 부분이 안 보입니다.\r
  snippet: |-\r
    storeLocation = [37.5665, 126.9780]\r
    m12 = folium.Map(location=storeLocation, zoom_start=14)\r
\r
    folium.Marker(\r
        location=storeLocation,\r
        popup="매장",\r
        icon=folium.Icon(color="red", icon="home")\r
    ).add_to(m12)\r
\r
    folium.Circle(\r
        location=storeLocation,\r
        radius=1000,\r
        color="green",\r
        fill=True,\r
        fill_opacity=0.1,\r
        popup="1km 배달 가능"\r
    ).add_to(m12)\r
\r
    folium.Circle(\r
        location=storeLocation,\r
        radius=2000,\r
        color="orange",\r
        fill=True,\r
        fill_opacity=0.1,\r
        popup="2km 배달 가능 (추가요금)"\r
    ).add_to(m12)\r
\r
    folium.Circle(\r
        location=storeLocation,\r
        radius=3000,\r
        color="red",\r
        fill=False,\r
        popup="3km 배달 불가"\r
    ).add_to(m12)\r
\r
    m12\r
  exercise:\r
    prompt: 9단계. 여러 도형 조합 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      storeLocation = [37.5665, 126.9780]\r
      m12 = folium.Map(location=storeLocation, zoom_start=14)\r
\r
      folium.Marker(\r
          location=storeLocation,\r
          popup="매장",\r
          icon=folium.Icon(color="red", icon="home")\r
      ).add_to(m12)\r
\r
      folium.Circle(\r
          location=storeLocation,\r
          radius=1000,\r
          color="green",\r
          fill=True,\r
          fill_opacity=0.1,\r
          popup="1km 배달 가능"\r
      ).add_to(m12)\r
\r
      folium.Circle(\r
          location=storeLocation,\r
          radius=2000,\r
          color="orange",\r
          fill=True,\r
          fill_opacity=0.1,\r
          popup="2km 배달 가능 (추가요금)"\r
      ).add_to(m12)\r
\r
      folium.Circle(\r
          location=storeLocation,\r
          radius=3000,\r
          color="red",\r
          fill=False,\r
          popup="3km 배달 불가"\r
      ).add_to(m12)\r
\r
      m12\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 9단계. 여러 도형 조합에서 \`storeLocation\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 9단계. 여러 도형 조합 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step10_complete\r
  title: 10단계. 완성 예제\r
  structuredPrimary: true\r
  subtitle: 조깅 코스 지도\r
  goal: 10단계. 완성 예제에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 조깅 코스를 경로와 구간별 정보로 표시하는 지도를 만듭니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    startPoint = [37.5283, 126.9200]\r
    jogMap = folium.Map(location=[37.5300, 126.9350], zoom_start=14)\r
\r
    jogRoute = [\r
        [37.5283, 126.9200],\r
        [37.5300, 126.9280],\r
        [37.5320, 126.9360],\r
        [37.5310, 126.9440],\r
        [37.5280, 126.9500]\r
    ]\r
\r
    folium.PolyLine(\r
        locations=jogRoute,\r
        color="blue",\r
        weight=5,\r
        opacity=0.8\r
    ).add_to(jogMap)\r
\r
    folium.Marker(\r
        location=jogRoute[0],\r
        popup="<b>출발점</b><br>준비운동",\r
        icon=folium.Icon(color="green", icon="play")\r
    ).add_to(jogMap)\r
\r
    folium.Marker(\r
        location=jogRoute[-1],\r
        popup="<b>도착점</b><br>스트레칭",\r
        icon=folium.Icon(color="red", icon="stop")\r
    ).add_to(jogMap)\r
\r
    folium.CircleMarker(\r
        location=jogRoute[2],\r
        radius=10,\r
        color="orange",\r
        fill=True,\r
        popup="중간 지점 (1.5km)"\r
    ).add_to(jogMap)\r
\r
    restArea = [\r
        [37.5305, 126.9350],\r
        [37.5335, 126.9350],\r
        [37.5335, 126.9380],\r
        [37.5305, 126.9380]\r
    ]\r
\r
    folium.Polygon(\r
        locations=restArea,\r
        color="green",\r
        fill=True,\r
        fill_opacity=0.3,\r
        popup="휴식 공간"\r
    ).add_to(jogMap)\r
\r
    jogMap\r
  exercise:\r
    prompt: 10단계. 완성 예제 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      startPoint = [37.5283, 126.9200]\r
      jogMap = folium.Map(location=[37.5300, 126.9350], zoom_start=14)\r
\r
      jogRoute = [\r
          [37.5283, 126.9200],\r
          [37.5300, 126.9280],\r
          [37.5320, 126.9360],\r
          [37.5310, 126.9440],\r
          [37.5280, 126.9500]\r
      ]\r
\r
      folium.PolyLine(\r
          locations=jogRoute,\r
          color="blue",\r
          weight=5,\r
          opacity=0.8\r
      ).add_to(jogMap)\r
\r
      folium.Marker(\r
          location=jogRoute[0],\r
          popup="<b>출발점</b><br>준비운동",\r
          icon=folium.Icon(color="green", icon="play")\r
      ).add_to(jogMap)\r
\r
      folium.Marker(\r
          location=jogRoute[-1],\r
          popup="<b>도착점</b><br>스트레칭",\r
          icon=folium.Icon(color="red", icon="stop")\r
      ).add_to(jogMap)\r
\r
      folium.CircleMarker(\r
          location=jogRoute[2],\r
          radius=10,\r
          color="orange",\r
          fill=True,\r
          popup="중간 지점 (1.5km)"\r
      ).add_to(jogMap)\r
\r
      restArea = [\r
          [37.5305, 126.9350],\r
          [37.5335, 126.9350],\r
          [37.5335, 126.9380],\r
          [37.5305, 126.9380]\r
      ]\r
\r
      folium.Polygon(\r
          locations=restArea,\r
          color="green",\r
          fill=True,\r
          fill_opacity=0.3,\r
          popup="휴식 공간"\r
      ).add_to(jogMap)\r
\r
      jogMap\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 10단계. 완성 예제에서 \`startPoint\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 10단계. 완성 예제 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step11_workflow\r
  title: 11단계. 실무 도형 지도 검증\r
  structuredPrimary: true\r
  subtitle: 예측 → 도형 오류 확인 → 렌더 검증 → 기준 실험\r
  goal: 11단계. 실무 도형 지도 검증에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.\r
  explanation: |-\r
    도형 지도는 영역이 그려졌다고 끝이 아닙니다. 업무용 구역, 경로, 반경 지도에서는 다각형 꼭짓점 수, 좌표 범위, 반경 기준, 렌더 결과를 코드로 검증해야 보고서와 운영 판단에 쓸 수 있습니다.\r
\r
    도형 지도는 시각화와 검증을 분리하지 않습니다. 구역 다각형, 실제 반경, 이동 경로, 기준 변경 실험이 함께 있어야 운영자가 믿고 쓰는 지도 학습이 됩니다.\r
  snippet: |-\r
    serviceZones = [\r
        {\r
            "name": "북부 점검구역",\r
            "polygon": [[37.580, 126.940], [37.600, 126.940], [37.600, 126.980], [37.580, 126.980]],\r
            "center": [37.590, 126.960],\r
            "radiusMeters": 1300,\r
            "incidents": 18,\r
        },\r
        {\r
            "name": "중앙 점검구역",\r
            "polygon": [[37.550, 126.950], [37.575, 126.950], [37.575, 126.990], [37.550, 126.990]],\r
            "center": [37.562, 126.970],\r
            "radiusMeters": 900,\r
            "incidents": 11,\r
        },\r
        {\r
            "name": "남부 점검구역",\r
            "polygon": [[37.515, 126.930], [37.545, 126.930], [37.545, 126.970], [37.515, 126.970]],\r
            "center": [37.530, 126.950],\r
            "radiusMeters": 1600,\r
            "incidents": 24,\r
        },\r
    ]\r
\r
    inspectionRoute = [zone["center"] for zone in serviceZones]\r
    priorityZoneNames = [zone["name"] for zone in serviceZones if zone["incidents"] >= 15]\r
    priorityZoneNames\r
  exercise:\r
    prompt: 11단계. 실무 도형 지도 검증 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.\r
    starterCode: |-\r
      serviceZones = [\r
          {\r
              "name": "북부 점검구역",\r
              "polygon": [[37.580, 126.940], [37.600, 126.940], [37.600, 126.980], [37.580, 126.980]],\r
              "center": [37.590, 126.960],\r
              "radiusMeters": 1300,\r
              "incidents": 18,\r
          },\r
          {\r
              "name": "중앙 점검구역",\r
              "polygon": [[37.550, 126.950], [37.575, 126.950], [37.575, 126.990], [37.550, 126.990]],\r
              "center": [37.562, 126.970],\r
              "radiusMeters": 900,\r
              "incidents": 11,\r
          },\r
          {\r
              "name": "남부 점검구역",\r
              "polygon": [[37.515, 126.930], [37.545, 126.930], [37.545, 126.970], [37.515, 126.970]],\r
              "center": [37.530, 126.950],\r
              "radiusMeters": 1600,\r
              "incidents": 24,\r
          },\r
      ]\r
\r
      inspectionRoute = [zone["center"] for zone in serviceZones]\r
      priorityZoneNames = [zone["name"] for zone in serviceZones if zone["incidents"] >= 15]\r
      priorityZoneNames\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 11단계. 실무 도형 지도 검증의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 11단계. 실무 도형 지도 검증 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 도형 그리기\r
  goal: 실습에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 지금까지 배운 내용을 활용하여 미션을 수행해봅시다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import folium\r
    parkCenter = [37.5512, 126.9882]\r
    parkBoundary = [\r
        [37.5480, 126.9850],\r
        [37.5540, 126.9850],\r
        [37.5540, 126.9920],\r
        [37.5480, 126.9920]\r
    ]\r
    facilities = [\r
        {"name": "화장실", "loc": [37.5500, 126.9870]},\r
        {"name": "매점", "loc": [37.5520, 126.9900]},\r
        {"name": "놀이터", "loc": [37.5510, 126.9880]}\r
    ]\r
    facilities\r
  exercise:\r
    prompt: 실습 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      import folium\r
      parkCenter = [37.5512, 126.9882]\r
      parkBoundary = [\r
          [37.5480, 126.9850],\r
          [37.5540, 126.9850],\r
          [37.5540, 126.9920],\r
          [37.5480, 126.9920]\r
      ]\r
      facilities = [\r
          {"name": "화장실", "loc": [37.5500, 126.9870]},\r
          {"name": "매점", "loc": [37.5520, 126.9900]},\r
          {"name": "놀이터", "loc": [37.5510, 126.9880]}\r
      ]\r
      facilities\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 실습에서 \`parkCenter\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 실습 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
`;export{e as default};