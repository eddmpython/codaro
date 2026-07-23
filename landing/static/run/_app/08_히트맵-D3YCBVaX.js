var e=`meta:
  packages:
  - folium
  id: folium_08
  title: 히트맵
  order: 8
  category: folium
  difficulty: ⭐⭐⭐
  badge: 중급
  tags:
  - folium
  - HeatMap
  - 히트맵
  - 밀도
  - 시각화
  seo:
    title: Folium HeatMap - 밀도 시각화
    description: Folium으로 히트맵을 만듭니다. 포인트 데이터의 밀도를 색상으로 시각화합니다.
    keywords:
    - folium
    - HeatMap
    - 히트맵
    - 밀도
    - gradient
intro:
  emoji: 🔥
  goal: 포인트 데이터를 히트맵으로 시각화합니다.
  description: 히트맵은 데이터의 밀집도를 색상으로 표현합니다. 많은 포인트가 모인 곳은 빨갛게, 적은 곳은 파랗게 표시됩니다. 인구 밀도, 매장 분포, 범죄 발생 지역 등을
    시각화할 때 사용합니다.
  direction: 히트맵에서 위치 데이터를 지도 레이어로 배치하고 마커/영역 표시를 검증합니다.
  benefits:
  - 위도/경도 데이터 확인 후 지도 레이어 구성에 맞는 코드 입력을 고릅니다.
  - 히트맵 결과를 마커와 저장 HTML 기준으로 즉시 점검합니다.
  - 완료한 코드를 위치 기반 리포트에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: 1단계. 라이브러리 불러오기 입력 확인
      detail: 입력 기준(위도/경도 데이터)과 필요한 조건을 먼저 고정합니다.
    - label: 2단계. 기본 히트맵 처리 실행
      detail: 지도 레이어 구성 코드를 실행해 중간 결과를 확인합니다.
    - label: 3단계. radius와 blu 결과 검증
      detail: 마커와 저장 HTML 기준으로 실행 결과를 비교합니다.
    - label: 히트맵 재사용
      detail: 완성 코드를 위치 기반 리포트에 붙일 수 있게 정리합니다.
    runtime:
    - label: 지도 시각화 환경
      detail: folium 기준으로 로컬 Python 실행을 준비합니다.
    - label: 히트맵 실행
      detail: 셀을 실행해 마커와 저장 HTML와 예외 상태를 확인합니다.
    - label: 히트맵 완료
      detail: 검증된 코드를 위치 기반 리포트로 남깁니다.
sections:
- id: step1_import
  title: 1단계. 라이브러리 불러오기
  structuredPrimary: true
  subtitle: import
  goal: 1단계. 라이브러리 불러오기에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: import 준비가 정확해야 다음 셀과 자동화 코드에서 같은 이름을 안정적으로 재사용할 수 있습니다.
  explanation: folium과 HeatMap 플러그인을 불러옵니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    import folium
    from folium.plugins import HeatMap
  exercise:
    prompt: 1단계. 라이브러리 불러오기 예제에서 import한 모듈의 별칭이나 바로 이어지는 확인 호출을 바꿔 준비 상태를 확인하세요.
    starterCode: |-
      import folium
      from folium.plugins import HeatMap
    hints:
    - 바꿀 지점은 위도/경도 데이터을 만드는 첫 줄과 지도 레이어 구성 줄에서 찾으세요.
    - 실행 뒤 마커와 저장 HTML 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    noError: 1단계. 라이브러리 불러오기의 import 대상 모듈과 별칭이 현재 로컬 환경에서 준비되어야 합니다.
    resultCheck: 1단계. 라이브러리 불러오기 실행 결과가 마커와 저장 HTML 기준으로 바꾼 입력값을 반영해야 합니다.
- id: step2_basic_heatmap
  title: 2단계. 기본 히트맵
  structuredPrimary: true
  subtitle: HeatMap()
  goal: 2단계. 기본 히트맵에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    HeatMap은 좌표 리스트를 받아 밀도를 시각화합니다. 좌표가 많이 모인 곳이 더 진하게 표시됩니다.

    좌표가 밀집된 곳(시청 근처)이 더 진한 색으로 표시됩니다.
  snippet: |-
    seoulCenter = [37.5665, 126.9780]
    m1 = folium.Map(location=seoulCenter, zoom_start=13)

    heatData = [
        [37.5665, 126.9780],
        [37.5670, 126.9785],
        [37.5660, 126.9775],
        [37.5668, 126.9782],
        [37.5663, 126.9778],
        [37.5700, 126.9750],
        [37.5705, 126.9755],
        [37.5630, 126.9820],
        [37.5632, 126.9825]
    ]

    HeatMap(heatData).add_to(m1)

    m1
  exercise:
    prompt: 2단계. 기본 히트맵 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      seoulCenter = [37.5665, 126.9780]
      m1 = folium.Map(location=seoulCenter, zoom_start=13)

      heatData = [
          [37.5665, 126.9780],
          [37.5670, 126.9785],
          [37.5660, 126.9775],
          [37.5668, 126.9782],
          [37.5663, 126.9778],
          [37.5700, 126.9750],
          [37.5705, 126.9755],
          [37.5630, 126.9820],
          [37.5632, 126.9825]
      ]

      HeatMap(heatData).add_to(m1)

      m1
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    noError: 2단계. 기본 히트맵에서 \`seoulCenter\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 2단계. 기본 히트맵 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: step3_radius_blur
  title: 3단계. radius와 blur
  structuredPrimary: true
  subtitle: 크기 조절
  goal: 3단계. radius와 blur에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    radius는 각 포인트의 영향 범위, blur는 경계의 부드러움을 조절합니다.

    radius를 크게 하면 넓게 퍼지고, blur를 높이면 경계가 부드러워집니다. 기본값은 radius=25, blur=15입니다.
  snippet: |-
    m2 = folium.Map(location=seoulCenter, zoom_start=13)

    HeatMap(
        heatData,
        radius=25
    ).add_to(m2)

    m2
  exercise:
    prompt: 3단계. radius와 blur 예제에서 \`m2\`, \`radius\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.
    starterCode: |-
      m2 = folium.Map(location=seoulCenter, zoom_start=13)

      HeatMap(
          heatData,
          radius=25
      ).add_to(m2)

      m2
    hints:
    - 바꿀 지점은 \`m2 = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`m2\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    noError: 3단계. radius와 blur에서 \`m2\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 3단계. radius와 blur 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: step4_gradient
  title: 4단계. 색상 그라데이션
  structuredPrimary: true
  subtitle: gradient
  goal: 4단계. 색상 그라데이션에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    gradient로 색상 구간을 지정합니다. 0~1 사이 값에 색상을 매핑합니다.

    gradient 키는 0~1 사이 값이고, 밀도가 높을수록 1에 가까운 색상이 적용됩니다.
  snippet: |-
    m4 = folium.Map(location=seoulCenter, zoom_start=13)

    customGradient = {
        0.2: "blue",
        0.4: "lime",
        0.6: "yellow",
        0.8: "orange",
        1.0: "red"
    }

    HeatMap(
        heatData,
        gradient=customGradient,
        radius=25
    ).add_to(m4)

    m4
  exercise:
    prompt: 4단계. 색상 그라데이션 예제에서 \`m4\`, \`customGradient\`, \`gradient\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.
    starterCode: |-
      m4 = folium.Map(location=seoulCenter, zoom_start=13)

      customGradient = {
          0.2: "blue",
          0.4: "lime",
          0.6: "yellow",
          0.8: "orange",
          1.0: "red"
      }

      HeatMap(
          heatData,
          gradient=customGradient,
          radius=25
      ).add_to(m4)

      m4
    hints:
    - 바꿀 지점은 \`m4 = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`m4\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    noError: 4단계. 색상 그라데이션에서 \`m4\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 4단계. 색상 그라데이션 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: step5_weighted_heatmap
  title: 5단계. 가중치 히트맵
  structuredPrimary: true
  subtitle: weight
  goal: 5단계. 가중치 히트맵에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    좌표에 가중치를 추가하면 특정 포인트를 더 강조할 수 있습니다. [위도, 경도, 가중치] 형태로 데이터를 전달합니다.

    가중치가 1에 가까울수록 더 진하게 표시됩니다. 매출액, 인구수 등을 가중치로 사용합니다.
  snippet: |-
    m6 = folium.Map(location=seoulCenter, zoom_start=13)

    weightedData = [
        [37.5665, 126.9780, 1.0],
        [37.5670, 126.9785, 0.8],
        [37.5660, 126.9775, 0.5],
        [37.5700, 126.9750, 0.3],
        [37.5630, 126.9820, 0.2]
    ]

    HeatMap(weightedData, radius=30).add_to(m6)

    m6
  exercise:
    prompt: 5단계. 가중치 히트맵 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      m6 = folium.Map(location=seoulCenter, zoom_start=13)

      weightedData = [
          [37.5665, 126.9780, 1.0],
          [37.5670, 126.9785, 0.8],
          [37.5660, 126.9775, 0.5],
          [37.5700, 126.9750, 0.3],
          [37.5630, 126.9820, 0.2]
      ]

      HeatMap(weightedData, radius=30).add_to(m6)

      m6
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    noError: 5단계. 가중치 히트맵에서 \`m6\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 5단계. 가중치 히트맵 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: step6_min_opacity
  title: 6단계. 최소 투명도
  structuredPrimary: true
  subtitle: min_opacity
  goal: 6단계. 최소 투명도에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    min_opacity로 낮은 밀도 영역의 최소 투명도를 설정합니다.

    min_opacity를 높이면 낮은 밀도 영역도 보입니다. 기본값은 0.5입니다.
  snippet: |-
    m7 = folium.Map(location=seoulCenter, zoom_start=13)

    HeatMap(
        heatData,
        min_opacity=0.3,
        radius=25
    ).add_to(m7)

    m7
  exercise:
    prompt: 6단계. 최소 투명도 예제에서 \`m7\`, \`min_opacity\`, \`radius\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.
    starterCode: |-
      m7 = folium.Map(location=seoulCenter, zoom_start=13)

      HeatMap(
          heatData,
          min_opacity=0.3,
          radius=25
      ).add_to(m7)

      m7
    hints:
    - 바꿀 지점은 \`m7 = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`m7\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    noError: 6단계. 최소 투명도에서 \`m7\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 6단계. 최소 투명도 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: step7_max_zoom
  title: 7단계. 줌 레벨 설정
  structuredPrimary: true
  subtitle: max_zoom
  goal: 7단계. 줌 레벨 설정에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    max_zoom으로 히트맵이 표시되는 최대 줌 레벨을 설정합니다. 높은 줌에서는 포인트가 분산됩니다.

    줌을 많이 확대하면 포인트들이 분산되어 히트맵 효과가 줄어듭니다.
  snippet: |-
    m8 = folium.Map(location=seoulCenter, zoom_start=13)

    HeatMap(
        heatData,
        max_zoom=15,
        radius=25
    ).add_to(m8)

    m8
  exercise:
    prompt: 7단계. 줌 레벨 설정 예제에서 \`m8\`, \`max_zoom\`, \`radius\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.
    starterCode: |-
      m8 = folium.Map(location=seoulCenter, zoom_start=13)

      HeatMap(
          heatData,
          max_zoom=15,
          radius=25
      ).add_to(m8)

      m8
    hints:
    - 바꿀 지점은 \`m8 = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`m8\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    noError: 7단계. 줌 레벨 설정에서 \`m8\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 7단계. 줌 레벨 설정 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: step8_large_data
  title: 8단계. 대량 데이터
  structuredPrimary: true
  subtitle: 많은 포인트
  goal: 8단계. 대량 데이터에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.
  explanation: |-
    히트맵은 대량의 포인트 데이터에서 진가를 발휘합니다. 랜덤 데이터로 테스트합니다.

    특정 위치에 포인트를 집중시키면 그 영역이 더 진하게 표시됩니다.
  snippet: |-
    import random

    m9 = folium.Map(location=seoulCenter, zoom_start=12)

    largeData = []
    for _ in range(100):
        lat = 37.5 + random.uniform(-0.05, 0.05)
        lon = 126.95 + random.uniform(-0.05, 0.05)
        largeData.append([lat, lon])

    for _ in range(50):
        lat = 37.5665 + random.uniform(-0.01, 0.01)
        lon = 126.9780 + random.uniform(-0.01, 0.01)
        largeData.append([lat, lon])

    HeatMap(largeData, radius=15).add_to(m9)

    m9
  exercise:
    prompt: 8단계. 대량 데이터 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.
    starterCode: |-
      import random

      m9 = folium.Map(location=seoulCenter, zoom_start=12)

      largeData = []
      for _ in range(100):
          lat = 37.5 + random.uniform(-0.05, 0.05)
          lon = 126.95 + random.uniform(-0.05, 0.05)
          largeData.append([lat, lon])

      for _ in range(50):
          lat = 37.5665 + random.uniform(-0.01, 0.01)
          lon = 126.9780 + random.uniform(-0.01, 0.01)
          largeData.append([lat, lon])

      HeatMap(largeData, radius=15).add_to(m9)

      m9
    hints:
    - 바꿀 지점은 \`largeData\`를 만드는 반복 횟수, 좌표 범위, HeatMap의 radius 값입니다.
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.
  check:
    noError: 8단계. 대량 데이터의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.
    resultCheck: 8단계. 대량 데이터 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.
- id: step9_with_markers
  title: 9단계. 마커와 조합
  structuredPrimary: true
  subtitle: 히트맵 + 마커
  goal: 9단계. 마커와 조합에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.
  explanation: |-
    히트맵 위에 마커를 추가하여 주요 위치를 강조합니다.

    밝은 배경(CartoDB Positron)에서 히트맵이 더 잘 보입니다.
  snippet: |-
    m10 = folium.Map(location=seoulCenter, zoom_start=13, tiles="CartoDB Positron")

    storeLocations = []
    for _ in range(30):
        lat = 37.5665 + random.uniform(-0.02, 0.02)
        lon = 126.9780 + random.uniform(-0.02, 0.02)
        storeLocations.append([lat, lon])

    for _ in range(20):
        lat = 37.5500 + random.uniform(-0.01, 0.01)
        lon = 126.9900 + random.uniform(-0.01, 0.01)
        storeLocations.append([lat, lon])

    HeatMap(
        storeLocations,
        radius=20,
        gradient={0.4: "yellow", 0.6: "orange", 1: "red"}
    ).add_to(m10)

    folium.Marker(
        seoulCenter,
        popup="본사",
        icon=folium.Icon(color="blue", icon="home")
    ).add_to(m10)

    m10
  exercise:
    prompt: 9단계. 마커와 조합 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.
    starterCode: |-
      m10 = folium.Map(location=seoulCenter, zoom_start=13, tiles="CartoDB Positron")

      storeLocations = []
      for _ in range(30):
          lat = 37.5665 + random.uniform(-0.02, 0.02)
          lon = 126.9780 + random.uniform(-0.02, 0.02)
          storeLocations.append([lat, lon])

      for _ in range(20):
          lat = 37.5500 + random.uniform(-0.01, 0.01)
          lon = 126.9900 + random.uniform(-0.01, 0.01)
          storeLocations.append([lat, lon])

      HeatMap(
          storeLocations,
          radius=20,
          gradient={0.4: "yellow", 0.6: "orange", 1: "red"}
      ).add_to(m10)

      folium.Marker(
          seoulCenter,
          popup="본사",
          icon=folium.Icon(color="blue", icon="home")
      ).add_to(m10)

      m10
    hints:
    - 바꿀 지점은 \`complaintHeatRows\`의 \`district\`, \`loc\`, \`weight\` 값입니다.
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.
  check:
    noError: 9단계. 마커와 조합의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.
    resultCheck: 9단계. 마커와 조합 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.
- id: step10_complete
  title: 10단계. 완성 예제
  structuredPrimary: true
  subtitle: 인구 밀도 지도
  goal: 10단계. 완성 예제에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.
  explanation: 서울 주요 지역의 인구 밀도를 히트맵으로 시각화합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    import random

    densityMap = folium.Map(
        location=[37.55, 126.98],
        zoom_start=12,
        tiles="CartoDB Dark_Matter"
    )

    densityData = []

    gangnam = [37.4979, 127.0276]
    for _ in range(80):
        lat = gangnam[0] + random.uniform(-0.015, 0.015)
        lon = gangnam[1] + random.uniform(-0.015, 0.015)
        densityData.append([lat, lon, 0.8])

    myeongdong = [37.5636, 126.9869]
    for _ in range(60):
        lat = myeongdong[0] + random.uniform(-0.01, 0.01)
        lon = myeongdong[1] + random.uniform(-0.01, 0.01)
        densityData.append([lat, lon, 0.9])

    hongdae = [37.5563, 126.9236]
    for _ in range(50):
        lat = hongdae[0] + random.uniform(-0.012, 0.012)
        lon = hongdae[1] + random.uniform(-0.012, 0.012)
        densityData.append([lat, lon, 0.7])

    for _ in range(100):
        lat = 37.55 + random.uniform(-0.08, 0.08)
        lon = 126.98 + random.uniform(-0.08, 0.08)
        densityData.append([lat, lon, 0.2])

    densityGradient = {
        0.2: "#0000ff",
        0.4: "#00ffff",
        0.6: "#00ff00",
        0.8: "#ffff00",
        1.0: "#ff0000"
    }

    HeatMap(
        densityData,
        radius=25,
        blur=20,
        gradient=densityGradient,
        min_opacity=0.4
    ).add_to(densityMap)

    hotspots = [
        {"name": "강남", "loc": gangnam},
        {"name": "명동", "loc": myeongdong},
        {"name": "홍대", "loc": hongdae}
    ]

    for spot in hotspots:
        folium.Marker(
            location=spot["loc"],
            popup=spot["name"],
            icon=folium.Icon(color="white", icon="star")
        ).add_to(densityMap)

    densityMap
  exercise:
    prompt: 10단계. 완성 예제 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.
    starterCode: |-
      import random

      densityMap = folium.Map(
          location=[37.55, 126.98],
          zoom_start=12,
          tiles="CartoDB Dark_Matter"
      )

      densityData = []

      gangnam = [37.4979, 127.0276]
      for _ in range(80):
          lat = gangnam[0] + random.uniform(-0.015, 0.015)
          lon = gangnam[1] + random.uniform(-0.015, 0.015)
          densityData.append([lat, lon, 0.8])

      myeongdong = [37.5636, 126.9869]
      for _ in range(60):
          lat = myeongdong[0] + random.uniform(-0.01, 0.01)
          lon = myeongdong[1] + random.uniform(-0.01, 0.01)
          densityData.append([lat, lon, 0.9])

      hongdae = [37.5563, 126.9236]
      for _ in range(50):
          lat = hongdae[0] + random.uniform(-0.012, 0.012)
          lon = hongdae[1] + random.uniform(-0.012, 0.012)
          densityData.append([lat, lon, 0.7])

      for _ in range(100):
          lat = 37.55 + random.uniform(-0.08, 0.08)
          lon = 126.98 + random.uniform(-0.08, 0.08)
          densityData.append([lat, lon, 0.2])

      densityGradient = {
          0.2: "#0000ff",
          0.4: "#00ffff",
          0.6: "#00ff00",
          0.8: "#ffff00",
          1.0: "#ff0000"
      }

      HeatMap(
          densityData,
          radius=25,
          blur=20,
          gradient=densityGradient,
          min_opacity=0.4
      ).add_to(densityMap)

      hotspots = [
          {"name": "강남", "loc": gangnam},
          {"name": "명동", "loc": myeongdong},
          {"name": "홍대", "loc": hongdae}
      ]

      for spot in hotspots:
          folium.Marker(
              location=spot["loc"],
              popup=spot["name"],
              icon=folium.Icon(color="white", icon="star")
          ).add_to(densityMap)

      densityMap
    hints:
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.
  check:
    noError: 10단계. 완성 예제의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.
    resultCheck: 10단계. 완성 예제 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.
- id: step11_workflow
  title: 11단계. 실무 히트맵 검증
  structuredPrimary: true
  subtitle: 예측 → 데이터 오류 확인 → 렌더 검증 → 기준 실험
  goal: 11단계. 실무 히트맵 검증에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 히트맵은 좌표와 가중치가 조금만 틀려도 밀집 지역 해석이 달라지므로 데이터 행과 집계 결과를 함께 확인해야 합니다.
  explanation: |-
    히트맵은 색이 진한 곳을 보는 도구지만, 실무에서는 그 색이 믿을 만한 데이터에서 나온 것인지가 먼저입니다. 좌표 범위, 가중치 범위, 권역별 합계, 렌더 결과를 검증한 뒤 radius와 임계값을 바꿔 해석이 어떻게 달라지는지 실험해야 합니다.

    히트맵은 색보다 데이터 계약이 먼저입니다. 좌표, 가중치, 권역 합계, 렌더 결과를 검증하면 밀도 지도를 업무 리포트의 근거로 사용할 수 있습니다.
  snippet: |-
    complaintHeatRows = [
        {"district": "강남", "loc": [37.4979, 127.0276], "weight": 0.95, "type": "배송지연"},
        {"district": "강남", "loc": [37.5010, 127.0310], "weight": 0.80, "type": "재고부족"},
        {"district": "강남", "loc": [37.4930, 127.0240], "weight": 0.70, "type": "배송지연"},
        {"district": "홍대", "loc": [37.5563, 126.9236], "weight": 0.65, "type": "응대지연"},
        {"district": "홍대", "loc": [37.5580, 126.9255], "weight": 0.55, "type": "응대지연"},
        {"district": "여의도", "loc": [37.5219, 126.9245], "weight": 0.45, "type": "배송지연"},
        {"district": "여의도", "loc": [37.5260, 126.9290], "weight": 0.35, "type": "문의증가"},
    ]

    districtHeatScore = {}
    for row in complaintHeatRows:
        districtHeatScore[row["district"]] = districtHeatScore.get(row["district"], 0) + row["weight"]

    hottestDistrict = max(districtHeatScore, key=districtHeatScore.get)
    hottestDistrict, round(districtHeatScore[hottestDistrict], 2)
  exercise:
    prompt: 11단계. 실무 히트맵 검증 예제에서 민원 좌표, 구 이름, 가중치를 바꾸고 가장 뜨거운 구 집계가 달라지는지 확인하세요.
    starterCode: |-
      complaintHeatRows = [
          {"district": "강남", "loc": [37.4979, 127.0276], "weight": 0.95, "type": "배송지연"},
          {"district": "강남", "loc": [37.5010, 127.0310], "weight": 0.80, "type": "재고부족"},
          {"district": "강남", "loc": [37.4930, 127.0240], "weight": 0.70, "type": "배송지연"},
          {"district": "홍대", "loc": [37.5563, 126.9236], "weight": 0.65, "type": "응대지연"},
          {"district": "홍대", "loc": [37.5580, 126.9255], "weight": 0.55, "type": "응대지연"},
          {"district": "여의도", "loc": [37.5219, 126.9245], "weight": 0.45, "type": "배송지연"},
          {"district": "여의도", "loc": [37.5260, 126.9290], "weight": 0.35, "type": "문의증가"},
      ]

      districtHeatScore = {}
      for row in complaintHeatRows:
          districtHeatScore[row["district"]] = districtHeatScore.get(row["district"], 0) + row["weight"]

      hottestDistrict = max(districtHeatScore, key=districtHeatScore.get)
      hottestDistrict, round(districtHeatScore[hottestDistrict], 2)
    hints:
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.
    - 실행 뒤 구별 누적 점수와 \`hottestDistrict\`가 바꾼 히트맵 입력을 반영하는지 보세요.
  check:
    noError: 11단계. 실무 히트맵 검증의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.
    resultCheck: 11단계. 실무 히트맵 검증 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.
- id: practice
  title: 실습
  structuredPrimary: true
  subtitle: 히트맵
  goal: 실습에서 지도 레이어 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.
  explanation: 지금까지 배운 내용을 활용하여 미션을 수행해봅시다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    import folium
    from folium.plugins import HeatMap
    import random
    incidentData = []
    hotspot1 = [37.57, 126.98]
    for _ in range(40):
        lat = hotspot1[0] + random.uniform(-0.008, 0.008)
        lon = hotspot1[1] + random.uniform(-0.008, 0.008)
        incidentData.append([lat, lon])

    hotspot2 = [37.56, 126.99]
    for _ in range(25):
        lat = hotspot2[0] + random.uniform(-0.006, 0.006)
        lon = hotspot2[1] + random.uniform(-0.006, 0.006)
        incidentData.append([lat, lon])

    len(incidentData)
  exercise:
    prompt: 실습 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.
    starterCode: |-
      import folium
      from folium.plugins import HeatMap
      import random
      incidentData = []
      hotspot1 = [37.57, 126.98]
      for _ in range(40):
          lat = hotspot1[0] + random.uniform(-0.008, 0.008)
          lon = hotspot1[1] + random.uniform(-0.008, 0.008)
          incidentData.append([lat, lon])

      hotspot2 = [37.56, 126.99]
      for _ in range(25):
          lat = hotspot2[0] + random.uniform(-0.006, 0.006)
          lon = hotspot2[1] + random.uniform(-0.006, 0.006)
          incidentData.append([lat, lon])

      len(incidentData)
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
  - id: folium_08-heatmap-weight-data-evidence-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - step1_import
    - practice
    title: 공간 heatmap 데이터 증거 만들기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: 점 밀도와 weight 합을 인구·수요로 오해하지 않는가에 답하기 전에 usable·excluded 분모와 축 범위를 고정한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 차트에 들어가지 않은 NULL 행도 excludedCount로 보존하세요.
    - 축 범위와 그룹별 표본 수 없이 모양만 해석하지 마세요.
    exercise:
      prompt: prepare_heatmap_weight(rows)를 완성해 차트에 실제 사용된 행 수, 제외 수, 그룹 수, 두 축 범위를 반환하세요.
      starterCode: |-
        def prepare_heatmap_weight(rows):
            raise NotImplementedError
      solution: |
        def prepare_heatmap_weight(rows):
            required = ['longitude', 'latitude', 'weightBand']
            if any(not set(required) <= set(row) for row in rows):
                raise ValueError("chart schema mismatch")
            usable = [row for row in rows if all(row[name] is not None for name in required)]
            groups = {}
            group_field = 'weightBand'
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
      id: python.folium.folium_08.heatmap-weight-data-evidence.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.folium.folium_08.heatmap-weight-data-evidence.mastery.behavior.v1.fixture
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
        entry: prepare_heatmap_weight
        cases:
        - id: summarizes-visible-data
          arguments:
          - value:
            - longitude: 127.0
              latitude: 37.5
              weightBand: high
            - longitude: 127.01
              latitude: 37.51
              weightBand: low
            - longitude: 129.0
              latitude: 35.2
              weightBand: low
          expectedReturn:
            usableCount: 3
            excludedCount: 0
            groupCounts:
              high: 1
              low: 2
            xExtent:
            - 127.0
            - 129.0
            yExtent:
            - 35.2
            - 37.51
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
  - id: folium_08-heatmap-weight-encoding-transfer-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - folium_08-heatmap-weight-data-evidence-mastery
    title: 공간 heatmap 인코딩 계약을 새 문맥에 전이하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: 호출 위치의 건수와 severity weight를 구분한 공간 heatmap을 만든다라는 새 문맥에서도 mark·axis·transform·interaction 책임을 재현한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - 표현 mark만 맞아도 충분하지 않습니다. 축·그룹·변환을 함께 검사하세요.
    - description은 보이지 않는 사용자와 차트를 열 수 없는 상황의 핵심 증거입니다.
    exercise:
      prompt: audit_heatmap_weight(candidate)를 완성해 주어진 차트 사양의 오류와 기대 encoding을 반환하세요.
      starterCode: |-
        def audit_heatmap_weight(candidate):
            raise NotImplementedError
      solution: |
        def audit_heatmap_weight(candidate):
            expected = {'mark': 'heatmap', 'x': 'longitude', 'y': 'latitude', 'group': 'weightBand', 'transforms': ['normalize-radius', 'validate-coordinates', 'validate-weight'], 'interaction': 'pan-zoom'}
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
      id: python.folium.folium_08.heatmap-weight-encoding-transfer.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.folium.folium_08.heatmap-weight-encoding-transfer.transfer.behavior.v1.fixture
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
        entry: audit_heatmap_weight
        cases:
        - id: accepts-complete-encoding
          arguments:
          - value:
              mark: heatmap
              x: longitude
              y: latitude
              group: weightBand
              transforms:
              - normalize-radius
              - validate-coordinates
              - validate-weight
              interaction: pan-zoom
              description: 호출 위치의 건수와 severity weight를 구분한 공간 heatmap을 만든다
          expectedReturn:
            valid: true
            errors: []
            encoding:
              mark: heatmap
              x: longitude
              y: latitude
              group: weightBand
              transforms:
              - normalize-radius
              - validate-coordinates
              - validate-weight
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
              mark: heatmap
              x: longitude
              y: latitude
              group: weightBand
              transforms:
              - normalize-radius
              - validate-coordinates
              - validate-weight
              interaction: pan-zoom
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: folium_08-heatmap-weight-interpretation-retrieval-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - folium_08-heatmap-weight-encoding-transfer-transfer
    title: 공간 heatmap 해석 위험 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: 점 밀도와 weight 합을 인구·수요로 오해하지 않는가을 다시 판단할 때 차트 선택과 증거 한계를 구분한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - 차트가 보여주는 패턴과 인과 주장을 구분하세요.
    - 축·분모·결측·표본 수 중 무엇이 해석을 바꾸는지 명시하세요.
    exercise:
      prompt: choose_heatmap_weight(situation)를 완성해 encoding, evidence, risk를 반환하세요.
      starterCode: |-
        def choose_heatmap_weight(situation):
            raise NotImplementedError
      solution: |
        def choose_heatmap_weight(situation):
            table = {'event-density': {'encoding': 'unweighted heatmap', 'evidence': 'point count', 'risk': 'population exposure'}, 'severity-weight': {'encoding': 'weighted heatmap', 'evidence': 'weight definition', 'risk': 'one extreme point'}, 'precise-location': {'encoding': 'clustered markers', 'evidence': 'individual records', 'risk': 'heatmap hides points'}}
            if situation not in table:
                raise ValueError('unknown situation')
            return table[situation]
      hints: *id003
    check:
      id: python.folium.folium_08.heatmap-weight-interpretation-retrieval.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.folium.folium_08.heatmap-weight-interpretation-retrieval.retrieval.behavior.v1.fixture
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
        entry: choose_heatmap_weight
        cases:
        - id: recalls-event-density
          arguments:
          - value: event-density
          expectedReturn:
            encoding: unweighted heatmap
            evidence: point count
            risk: population exposure
        - id: recalls-severity-weight
          arguments:
          - value: severity-weight
          expectedReturn:
            encoding: weighted heatmap
            evidence: weight definition
            risk: one extreme point
        - id: rejects-unknown
          arguments:
          - value: unknown
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};