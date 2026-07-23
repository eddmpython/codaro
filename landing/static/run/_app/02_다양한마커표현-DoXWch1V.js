var e=`meta:\r
  packages:\r
  - folium\r
  id: folium_02\r
  title: 다양한마커표현\r
  order: 2\r
  category: folium\r
  difficulty: ⭐\r
  badge: 입문\r
  tags:\r
  - folium\r
  - Marker\r
  - Icon\r
  - popup\r
  - tooltip\r
  - HTML\r
  seo:\r
    title: Folium 마커 커스터마이징 - 아이콘과 팝업\r
    description: Folium에서 다양한 마커 스타일을 사용합니다. 커스텀 아이콘, HTML 팝업, 툴팁을 배웁니다.\r
    keywords:\r
    - folium\r
    - Marker\r
    - Icon\r
    - DivIcon\r
    - popup\r
    - tooltip\r
intro:\r
  emoji: 🎨\r
  goal: 여러 종류의 마커와 아이콘을 사용하여 지도를 꾸밉니다.\r
  description: 마커의 다양한 표현 방법을 배웁니다. Icon()으로 색상과 아이콘을 변경하고, DivIcon()으로 완전한 커스텀 마커를 만듭니다. popup에 HTML을\r
    넣어 풍부한 정보를 표시합니다.\r
  direction: 다양한마커표현에서 위치 데이터를 지도 레이어로 배치하고 마커/영역 표시를 검증합니다.\r
  benefits:\r
  - 위도/경도 데이터 확인 후 지도 레이어 구성에 맞는 코드 입력을 고릅니다.\r
  - 다양한마커표현 결과를 마커와 저장 HTML 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 위치 기반 리포트에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 라이브러리 불러오기 입력 확인\r
      detail: 입력 기준(위도/경도 데이터)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 아이콘 색상 처리 실행\r
      detail: 지도 레이어 구성 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 아이콘 종류 결과 검증\r
      detail: 마커와 저장 HTML 기준으로 실행 결과를 비교합니다.\r
    - label: 다양한마커표현 재사용\r
      detail: 완성 코드를 위치 기반 리포트에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 지도 시각화 환경\r
      detail: folium 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 다양한마커표현 실행\r
      detail: 셀을 실행해 마커와 저장 HTML와 예외 상태를 확인합니다.\r
    - label: 다양한마커표현 완료\r
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
- id: step2_icon_colors\r
  title: 2단계. 아이콘 색상\r
  structuredPrimary: true\r
  subtitle: Icon(color=)\r
  goal: 2단계. 아이콘 색상에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.\r
  explanation: |-\r
    Icon()의 color 파라미터로 마커 색상을 지정합니다. 18가지 색상을 사용할 수 있습니다.\r
\r
    카테고리별로 색상을 다르게 하면 한눈에 구분할 수 있습니다. 음식점은 빨강, 카페는 파랑 등으로 구분하세요.\r
  snippet: |-\r
    seoulLoc = [37.5665, 126.9780]\r
    colorList = ["red", "blue", "green", "purple", "orange",\r
                 "darkred", "lightred", "beige", "darkblue", "darkgreen",\r
                 "cadetblue", "darkpurple", "white", "pink", "lightblue",\r
                 "lightgreen", "gray", "black"]\r
\r
    m1 = folium.Map(location=seoulLoc, zoom_start=13)\r
\r
    for i, clr in enumerate(colorList):\r
        offset = [seoulLoc[0] + (i // 6) * 0.01, seoulLoc[1] + (i % 6) * 0.01]\r
        folium.Marker(\r
            location=offset,\r
            popup=clr,\r
            icon=folium.Icon(color=clr)\r
        ).add_to(m1)\r
\r
    m1\r
  exercise:\r
    prompt: 2단계. 아이콘 색상 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.\r
    starterCode: |-\r
      seoulLoc = [37.5665, 126.9780]\r
      colorList = ["red", "blue", "green", "purple", "orange",\r
                   "darkred", "lightred", "beige", "darkblue", "darkgreen",\r
                   "cadetblue", "darkpurple", "white", "pink", "lightblue",\r
                   "lightgreen", "gray", "black"]\r
\r
      m1 = folium.Map(location=seoulLoc, zoom_start=13)\r
\r
      for i, clr in enumerate(colorList):\r
          offset = [seoulLoc[0] + (i // 6) * 0.01, seoulLoc[1] + (i % 6) * 0.01]\r
          folium.Marker(\r
              location=offset,\r
              popup=clr,\r
              icon=folium.Icon(color=clr)\r
          ).add_to(m1)\r
\r
      m1\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 2단계. 아이콘 색상의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 2단계. 아이콘 색상 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step3_icon_types\r
  title: 3단계. 아이콘 종류\r
  structuredPrimary: true\r
  subtitle: Icon(icon=)\r
  goal: 3단계. 아이콘 종류에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.\r
  explanation: |-\r
    icon 파라미터로 마커 안의 아이콘을 변경합니다. Glyphicon과 Font Awesome 아이콘을 사용할 수 있습니다.\r
\r
    Font Awesome 아이콘을 사용하려면 prefix='fa'를 추가하세요. 더 다양한 아이콘을 사용할 수 있습니다.\r
  snippet: |-\r
    glyphicons = ["home", "star", "heart", "cloud", "music",\r
                  "camera", "user", "glass", "flag", "gift"]\r
\r
    m2 = folium.Map(location=seoulLoc, zoom_start=14)\r
\r
    for i, icn in enumerate(glyphicons):\r
        offset = [seoulLoc[0] + (i // 5) * 0.008, seoulLoc[1] + (i % 5) * 0.008]\r
        folium.Marker(\r
            location=offset,\r
            popup=icn,\r
            icon=folium.Icon(color="blue", icon=icn)\r
        ).add_to(m2)\r
\r
    m2\r
  exercise:\r
    prompt: 3단계. 아이콘 종류 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.\r
    starterCode: |-\r
      glyphicons = ["home", "star", "heart", "cloud", "music",\r
                    "camera", "user", "glass", "flag", "gift"]\r
\r
      m2 = folium.Map(location=seoulLoc, zoom_start=14)\r
\r
      for i, icn in enumerate(glyphicons):\r
          offset = [seoulLoc[0] + (i // 5) * 0.008, seoulLoc[1] + (i % 5) * 0.008]\r
          folium.Marker(\r
              location=offset,\r
              popup=icn,\r
              icon=folium.Icon(color="blue", icon=icn)\r
          ).add_to(m2)\r
\r
      m2\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 3단계. 아이콘 종류의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 3단계. 아이콘 종류 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step4_html_popup\r
  title: 4단계. HTML 팝업\r
  structuredPrimary: true\r
  subtitle: 풍부한 정보 표시\r
  goal: 4단계. HTML 팝업에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    popup에 HTML을 넣어 이미지, 링크, 표 등을 표시할 수 있습니다.\r
\r
    Popup() 객체를 사용하면 max_width로 팝업 너비를 조절할 수 있습니다.\r
  snippet: |-\r
    htmlContent = """\r
    <div style="font-family: Arial; width: 200px;">\r
        <h4 style="color: #2E86AB;">서울시청</h4>\r
        <p style="margin: 5px 0;">주소: 서울특별시 중구 태평로1가</p>\r
        <p style="margin: 5px 0;">전화: 02-120</p>\r
        <hr>\r
        <small>클릭하여 상세 정보 확인</small>\r
    </div>\r
    """\r
\r
    m4 = folium.Map(location=seoulLoc, zoom_start=15)\r
    folium.Marker(\r
        location=seoulLoc,\r
        popup=folium.Popup(htmlContent, max_width=250),\r
        icon=folium.Icon(color="red", icon="info-sign")\r
    ).add_to(m4)\r
\r
    m4\r
  exercise:\r
    prompt: 4단계. HTML 팝업 예제에서 \`htmlContent\`, \`m4\`, \`location\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      htmlContent = """\r
      <div style="font-family: Arial; width: 200px;">\r
          <h4 style="color: #2E86AB;">서울시청</h4>\r
          <p style="margin: 5px 0;">주소: 서울특별시 중구 태평로1가</p>\r
          <p style="margin: 5px 0;">전화: 02-120</p>\r
          <hr>\r
          <small>클릭하여 상세 정보 확인</small>\r
      </div>\r
      """\r
\r
      m4 = folium.Map(location=seoulLoc, zoom_start=15)\r
      folium.Marker(\r
          location=seoulLoc,\r
          popup=folium.Popup(htmlContent, max_width=250),\r
          icon=folium.Icon(color="red", icon="info-sign")\r
      ).add_to(m4)\r
\r
      m4\r
    hints:\r
    - 바꿀 지점은 \`htmlContent = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`htmlContent\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    noError: 4단계. HTML 팝업에서 \`htmlContent\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 4단계. HTML 팝업 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step5_tooltip_style\r
  title: 5단계. 툴팁 스타일\r
  structuredPrimary: true\r
  subtitle: Tooltip()\r
  goal: 5단계. 툴팁 스타일에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    Tooltip() 객체로 툴팁을 더 세밀하게 제어할 수 있습니다.\r
\r
    permanent=True로 설정하면 마우스를 올리지 않아도 항상 툴팁이 표시됩니다.\r
  snippet: |-\r
    m5 = folium.Map(location=seoulLoc, zoom_start=14)\r
\r
    folium.Marker(\r
        location=[37.5665, 126.9780],\r
        tooltip=folium.Tooltip("항상 표시", permanent=True),\r
        icon=folium.Icon(color="blue")\r
    ).add_to(m5)\r
\r
    folium.Marker(\r
        location=[37.5665, 126.9880],\r
        tooltip=folium.Tooltip("<b>HTML 툴팁</b><br>여러 줄 가능"),\r
        icon=folium.Icon(color="green")\r
    ).add_to(m5)\r
\r
    m5\r
  exercise:\r
    prompt: 5단계. 툴팁 스타일 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      m5 = folium.Map(location=seoulLoc, zoom_start=14)\r
\r
      folium.Marker(\r
          location=[37.5665, 126.9780],\r
          tooltip=folium.Tooltip("항상 표시", permanent=True),\r
          icon=folium.Icon(color="blue")\r
      ).add_to(m5)\r
\r
      folium.Marker(\r
          location=[37.5665, 126.9880],\r
          tooltip=folium.Tooltip("<b>HTML 툴팁</b><br>여러 줄 가능"),\r
          icon=folium.Icon(color="green")\r
      ).add_to(m5)\r
\r
      m5\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 5단계. 툴팁 스타일에서 \`m5\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 5단계. 툴팁 스타일 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step6_divicon\r
  title: 6단계. DivIcon\r
  structuredPrimary: true\r
  subtitle: 완전 커스텀 마커\r
  goal: 6단계. DivIcon에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.\r
  explanation: |-\r
    DivIcon()으로 HTML/CSS를 사용한 완전한 커스텀 마커를 만들 수 있습니다.\r
\r
    DivIcon은 아무 HTML이나 마커로 사용할 수 있어 자유도가 높습니다. 로고, 이모지, 커스텀 디자인 모두 가능합니다.\r
  snippet: |-\r
    spots = [\r
        {"name": "1번", "loc": [37.5665, 126.9780]},\r
        {"name": "2번", "loc": [37.5600, 126.9850]},\r
        {"name": "3번", "loc": [37.5700, 126.9900]}\r
    ]\r
\r
    m6 = folium.Map(location=seoulLoc, zoom_start=14)\r
\r
    for i, spot in enumerate(spots, 1):\r
        folium.Marker(\r
            location=spot["loc"],\r
            popup=spot["name"],\r
            icon=folium.DivIcon(\r
                html=f"""\r
                <div style="\r
                    background-color: #E74C3C;\r
                    color: white;\r
                    width: 25px;\r
                    height: 25px;\r
                    border-radius: 50%;\r
                    text-align: center;\r
                    line-height: 25px;\r
                    font-weight: bold;\r
                    font-size: 14px;\r
                    border: 2px solid white;\r
                    box-shadow: 0 2px 5px rgba(0,0,0,0.3);\r
                ">{i}</div>\r
                """\r
            )\r
        ).add_to(m6)\r
\r
    m6\r
  exercise:\r
    prompt: 6단계. DivIcon 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.\r
    starterCode: |-\r
      spots = [\r
          {"name": "1번", "loc": [37.5665, 126.9780]},\r
          {"name": "2번", "loc": [37.5600, 126.9850]},\r
          {"name": "3번", "loc": [37.5700, 126.9900]}\r
      ]\r
\r
      m6 = folium.Map(location=seoulLoc, zoom_start=14)\r
\r
      for i, spot in enumerate(spots, 1):\r
          folium.Marker(\r
              location=spot["loc"],\r
              popup=spot["name"],\r
              icon=folium.DivIcon(\r
                  html=f"""\r
                  <div style="\r
                      background-color: #E74C3C;\r
                      color: white;\r
                      width: 25px;\r
                      height: 25px;\r
                      border-radius: 50%;\r
                      text-align: center;\r
                      line-height: 25px;\r
                      font-weight: bold;\r
                      font-size: 14px;\r
                      border: 2px solid white;\r
                      box-shadow: 0 2px 5px rgba(0,0,0,0.3);\r
                  ">{i}</div>\r
                  """\r
              )\r
          ).add_to(m6)\r
\r
      m6\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 6단계. DivIcon의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 6단계. DivIcon 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step7_emoji_marker\r
  title: 7단계. 이모지 마커\r
  structuredPrimary: true\r
  subtitle: DivIcon으로 이모지 사용\r
  goal: 7단계. 이모지 마커에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.\r
  explanation: |-\r
    DivIcon으로 이모지를 마커로 사용할 수 있습니다.\r
\r
    이모지 마커는 직관적이고 귀엽습니다. 카테고리별로 다른 이모지를 사용하면 구분이 쉽습니다.\r
  snippet: |-\r
    emojiSpots = [\r
        {"name": "카페", "loc": [37.5665, 126.9780], "emoji": "☕"},\r
        {"name": "음식점", "loc": [37.5600, 126.9750], "emoji": "🍽️"},\r
        {"name": "쇼핑", "loc": [37.5630, 126.9850], "emoji": "🛍️"},\r
        {"name": "공원", "loc": [37.5700, 126.9800], "emoji": "🌳"},\r
        {"name": "호텔", "loc": [37.5580, 126.9900], "emoji": "🏨"}\r
    ]\r
\r
    m7 = folium.Map(location=seoulLoc, zoom_start=14)\r
\r
    for spot in emojiSpots:\r
        folium.Marker(\r
            location=spot["loc"],\r
            popup=spot["name"],\r
            icon=folium.DivIcon(\r
                html=f'<div style="font-size: 24px;">{spot["emoji"]}</div>'\r
            )\r
        ).add_to(m7)\r
\r
    m7\r
  exercise:\r
    prompt: 7단계. 이모지 마커 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.\r
    starterCode: |-\r
      emojiSpots = [\r
          {"name": "카페", "loc": [37.5665, 126.9780], "emoji": "☕"},\r
          {"name": "음식점", "loc": [37.5600, 126.9750], "emoji": "🍽️"},\r
          {"name": "쇼핑", "loc": [37.5630, 126.9850], "emoji": "🛍️"},\r
          {"name": "공원", "loc": [37.5700, 126.9800], "emoji": "🌳"},\r
          {"name": "호텔", "loc": [37.5580, 126.9900], "emoji": "🏨"}\r
      ]\r
\r
      m7 = folium.Map(location=seoulLoc, zoom_start=14)\r
\r
      for spot in emojiSpots:\r
          folium.Marker(\r
              location=spot["loc"],\r
              popup=spot["name"],\r
              icon=folium.DivIcon(\r
                  html=f'<div style="font-size: 24px;">{spot["emoji"]}</div>'\r
              )\r
          ).add_to(m7)\r
\r
      m7\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 7단계. 이모지 마커의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 7단계. 이모지 마커 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step8_circle_marker\r
  title: 8단계. CircleMarker\r
  structuredPrimary: true\r
  subtitle: 원형 마커\r
  goal: 8단계. CircleMarker에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    CircleMarker()는 크기가 고정된 원형 마커입니다. 줌 레벨에 상관없이 같은 크기로 표시됩니다.\r
\r
    CircleMarker의 radius는 픽셀 단위입니다. Circle()의 radius는 미터 단위라서 줌에 따라 크기가 변합니다.\r
  snippet: |-\r
    m8 = folium.Map(location=seoulLoc, zoom_start=14)\r
\r
    folium.CircleMarker(\r
        location=[37.5665, 126.9780],\r
        radius=10,\r
        color="red",\r
        fill=True,\r
        fill_color="red",\r
        fill_opacity=0.7,\r
        popup="작은 원"\r
    ).add_to(m8)\r
\r
    folium.CircleMarker(\r
        location=[37.5600, 126.9850],\r
        radius=20,\r
        color="blue",\r
        fill=True,\r
        fill_color="blue",\r
        fill_opacity=0.5,\r
        popup="중간 원"\r
    ).add_to(m8)\r
\r
    folium.CircleMarker(\r
        location=[37.5700, 126.9700],\r
        radius=30,\r
        color="green",\r
        fill=True,\r
        fill_color="green",\r
        fill_opacity=0.3,\r
        popup="큰 원"\r
    ).add_to(m8)\r
\r
    m8\r
  exercise:\r
    prompt: 8단계. CircleMarker 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      m8 = folium.Map(location=seoulLoc, zoom_start=14)\r
\r
      folium.CircleMarker(\r
          location=[37.5665, 126.9780],\r
          radius=10,\r
          color="red",\r
          fill=True,\r
          fill_color="red",\r
          fill_opacity=0.7,\r
          popup="작은 원"\r
      ).add_to(m8)\r
\r
      folium.CircleMarker(\r
          location=[37.5600, 126.9850],\r
          radius=20,\r
          color="blue",\r
          fill=True,\r
          fill_color="blue",\r
          fill_opacity=0.5,\r
          popup="중간 원"\r
      ).add_to(m8)\r
\r
      folium.CircleMarker(\r
          location=[37.5700, 126.9700],\r
          radius=30,\r
          color="green",\r
          fill=True,\r
          fill_color="green",\r
          fill_opacity=0.3,\r
          popup="큰 원"\r
      ).add_to(m8)\r
\r
      m8\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 8단계. CircleMarker에서 \`m8\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 8단계. CircleMarker 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step9_data_driven\r
  title: 9단계. 데이터 기반 마커\r
  structuredPrimary: true\r
  subtitle: 값에 따른 시각화\r
  goal: 9단계. 데이터 기반 마커에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.\r
  explanation: |-\r
    데이터 값에 따라 마커 크기나 색상을 다르게 표시합니다.\r
\r
    데이터 값을 시각적 요소(크기, 색상, 투명도)에 매핑하면 패턴을 쉽게 파악할 수 있습니다.\r
  snippet: |-\r
    stores = [\r
        {"name": "강남점", "loc": [37.4979, 127.0276], "sales": 100},\r
        {"name": "홍대점", "loc": [37.5563, 126.9236], "sales": 80},\r
        {"name": "명동점", "loc": [37.5636, 126.9869], "sales": 150},\r
        {"name": "여의도점", "loc": [37.5219, 126.9245], "sales": 60}\r
    ]\r
\r
    m9 = folium.Map(location=seoulLoc, zoom_start=12)\r
\r
    for store in stores:\r
        radius = store["sales"] / 5\r
        folium.CircleMarker(\r
            location=store["loc"],\r
            radius=radius,\r
            color="crimson",\r
            fill=True,\r
            fill_color="crimson",\r
            fill_opacity=0.6,\r
            popup=f"{store['name']}: {store['sales']}억"\r
        ).add_to(m9)\r
\r
    m9\r
  exercise:\r
    prompt: 9단계. 데이터 기반 마커 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.\r
    starterCode: |-\r
      stores = [\r
          {"name": "강남점", "loc": [37.4979, 127.0276], "sales": 100},\r
          {"name": "홍대점", "loc": [37.5563, 126.9236], "sales": 80},\r
          {"name": "명동점", "loc": [37.5636, 126.9869], "sales": 150},\r
          {"name": "여의도점", "loc": [37.5219, 126.9245], "sales": 60}\r
      ]\r
\r
      m9 = folium.Map(location=seoulLoc, zoom_start=12)\r
\r
      for store in stores:\r
          radius = store["sales"] / 5\r
          folium.CircleMarker(\r
              location=store["loc"],\r
              radius=radius,\r
              color="crimson",\r
              fill=True,\r
              fill_color="crimson",\r
              fill_opacity=0.6,\r
              popup=f"{store['name']}: {store['sales']}억"\r
          ).add_to(m9)\r
\r
      m9\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 9단계. 데이터 기반 마커의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 9단계. 데이터 기반 마커 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step10_complete\r
  title: 10단계. 완성 예제\r
  structuredPrimary: true\r
  subtitle: 맛집 지도\r
  goal: 10단계. 완성 예제에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.\r
  explanation: 다양한 마커 스타일을 종합하여 맛집 지도를 만듭니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    restaurants = [\r
        {"name": "한식당", "loc": [37.5665, 126.9780], "category": "한식", "rating": 4.5},\r
        {"name": "이탈리안", "loc": [37.5600, 126.9850], "category": "양식", "rating": 4.2},\r
        {"name": "스시집", "loc": [37.5700, 126.9750], "category": "일식", "rating": 4.8},\r
        {"name": "중화요리", "loc": [37.5630, 126.9700], "category": "중식", "rating": 4.0}\r
    ]\r
\r
    categoryColors = {"한식": "red", "양식": "blue", "일식": "green", "중식": "orange"}\r
    categoryIcons = {"한식": "🍚", "양식": "🍝", "일식": "🍣", "중식": "🥟"}\r
\r
    foodMap = folium.Map(location=seoulLoc, zoom_start=14)\r
\r
    for rest in restaurants:\r
        cat = rest["category"]\r
        htmlPopup = f"""\r
        <div style="font-family: Arial; width: 150px;">\r
            <h4>{categoryIcons[cat]} {rest['name']}</h4>\r
            <p>카테고리: {cat}</p>\r
            <p>평점: {'⭐' * int(rest['rating'])} {rest['rating']}</p>\r
        </div>\r
        """\r
\r
        folium.Marker(\r
            location=rest["loc"],\r
            popup=folium.Popup(htmlPopup, max_width=200),\r
            tooltip=f"{rest['name']} ({rest['rating']}점)",\r
            icon=folium.Icon(color=categoryColors[cat], icon="cutlery", prefix="fa")\r
        ).add_to(foodMap)\r
\r
    foodMap\r
  exercise:\r
    prompt: 10단계. 완성 예제 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.\r
    starterCode: |-\r
      restaurants = [\r
          {"name": "한식당", "loc": [37.5665, 126.9780], "category": "한식", "rating": 4.5},\r
          {"name": "이탈리안", "loc": [37.5600, 126.9850], "category": "양식", "rating": 4.2},\r
          {"name": "스시집", "loc": [37.5700, 126.9750], "category": "일식", "rating": 4.8},\r
          {"name": "중화요리", "loc": [37.5630, 126.9700], "category": "중식", "rating": 4.0}\r
      ]\r
\r
      categoryColors = {"한식": "red", "양식": "blue", "일식": "green", "중식": "orange"}\r
      categoryIcons = {"한식": "🍚", "양식": "🍝", "일식": "🍣", "중식": "🥟"}\r
\r
      foodMap = folium.Map(location=seoulLoc, zoom_start=14)\r
\r
      for rest in restaurants:\r
          cat = rest["category"]\r
          htmlPopup = f"""\r
          <div style="font-family: Arial; width: 150px;">\r
              <h4>{categoryIcons[cat]} {rest['name']}</h4>\r
              <p>카테고리: {cat}</p>\r
              <p>평점: {'⭐' * int(rest['rating'])} {rest['rating']}</p>\r
          </div>\r
          """\r
\r
          folium.Marker(\r
              location=rest["loc"],\r
              popup=folium.Popup(htmlPopup, max_width=200),\r
              tooltip=f"{rest['name']} ({rest['rating']}점)",\r
              icon=folium.Icon(color=categoryColors[cat], icon="cutlery", prefix="fa")\r
          ).add_to(foodMap)\r
\r
      foodMap\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 10단계. 완성 예제의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 10단계. 완성 예제 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step11_workflow\r
  title: 11단계. 실무 마커 설계 검증\r
  structuredPrimary: true\r
  subtitle: 예측 → 오류 확인 → 렌더 검증 → 수정 실험\r
  goal: 11단계. 실무 마커 설계 검증에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.\r
  explanation: |-\r
    마커 커스터마이징은 예쁘게 보이는 것으로 끝나지 않습니다. 업무 지도에서는 지점 카테고리, 위험도, 팝업 정보가 빠짐없이 연결되어야 하고, 정의하지 않은 카테고리는 조용히 기본값으로 넘어가지 말고 오류로 확인해야 합니다.\r
\r
    마커 표현은 디자인 문제가 아니라 데이터 계약 문제입니다. 카테고리 매핑, 좌표 범위, 팝업 핵심 정보, 위험도 기준을 코드로 검증하면 지도 결과물을 업무 리포트로 믿고 사용할 수 있습니다.\r
  tips:\r
  - 마커 표현은 디자인 문제가 아니라 데이터 계약 문제입니다. 카테고리 매핑, 좌표 범위, 팝업 핵심 정보, 위험도 기준을 코드로 검증하면 지도 결과물을 업무 리포트로 믿고 사용할\r
    수 있습니다.\r
  snippet: |-\r
    operationSites = [\r
        {"name": "강남 플래그십", "loc": [37.4979, 127.0276], "category": "store", "riskScore": 82, "owner": "영업"},\r
        {"name": "성수 물류허브", "loc": [37.5446, 127.0557], "category": "warehouse", "riskScore": 64, "owner": "물류"},\r
        {"name": "마포 고객센터", "loc": [37.5663, 126.9019], "category": "support", "riskScore": 48, "owner": "CS"},\r
        {"name": "여의도 팝업존", "loc": [37.5219, 126.9245], "category": "store", "riskScore": 71, "owner": "마케팅"},\r
    ]\r
\r
    markerStyle = {\r
        "store": {"color": "red", "icon": "shopping-cart", "prefix": "fa"},\r
        "warehouse": {"color": "blue", "icon": "home", "prefix": "glyphicon"},\r
        "support": {"color": "green", "icon": "info-sign", "prefix": "glyphicon"},\r
    }\r
\r
    highRiskNames = [site["name"] for site in operationSites if site["riskScore"] >= 70]\r
    highRiskNames\r
  exercise:\r
    prompt: 11단계. 실무 마커 설계 검증 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.\r
    starterCode: |-\r
      operationSites = [\r
          {"name": "강남 플래그십", "loc": [37.4979, 127.0276], "category": "store", "riskScore": 82, "owner": "영업"},\r
          {"name": "성수 물류허브", "loc": [37.5446, 127.0557], "category": "warehouse", "riskScore": 64, "owner": "물류"},\r
          {"name": "마포 고객센터", "loc": [37.5663, 126.9019], "category": "support", "riskScore": 48, "owner": "CS"},\r
          {"name": "여의도 팝업존", "loc": [37.5219, 126.9245], "category": "store", "riskScore": 71, "owner": "마케팅"},\r
      ]\r
\r
      markerStyle = {\r
          "store": {"color": "red", "icon": "shopping-cart", "prefix": "fa"},\r
          "warehouse": {"color": "blue", "icon": "home", "prefix": "glyphicon"},\r
          "support": {"color": "green", "icon": "info-sign", "prefix": "glyphicon"},\r
      }\r
\r
      highRiskNames = [site["name"] for site in operationSites if site["riskScore"] >= 70]\r
      highRiskNames\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 11단계. 실무 마커 설계 검증의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 11단계. 실무 마커 설계 검증 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 마커 표현\r
  goal: 실습에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    지금까지 배운 내용을 활용하여 미션을 수행해봅시다.\r
\r
    각 미션은 import문부터 시작합니다. 위 예제를 실행했다면 import는 생략해도 됩니다.\r
  snippet: |-\r
    import folium\r
    tourCourse = [\r
        {"order": 1, "name": "경복궁", "loc": [37.5796, 126.9770]},\r
        {"order": 2, "name": "인사동", "loc": [37.5742, 126.9858]},\r
        {"order": 3, "name": "명동", "loc": [37.5636, 126.9869]},\r
        {"order": 4, "name": "남산타워", "loc": [37.5512, 126.9882]}\r
    ]\r
    tourCourse\r
  exercise:\r
    prompt: 실습 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      import folium\r
      tourCourse = [\r
          {"order": 1, "name": "경복궁", "loc": [37.5796, 126.9770]},\r
          {"order": 2, "name": "인사동", "loc": [37.5742, 126.9858]},\r
          {"order": 3, "name": "명동", "loc": [37.5636, 126.9869]},\r
          {"order": 4, "name": "남산타워", "loc": [37.5512, 126.9882]}\r
      ]\r
      tourCourse\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 실습에서 \`tourCourse\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 실습 실행 뒤 \`tourCourse\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.\r
`;export{e as default};