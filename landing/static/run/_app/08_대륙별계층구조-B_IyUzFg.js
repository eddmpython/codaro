var e=`meta:\r
  packages:\r
  - pandas\r
  - plotly\r
  id: plotly_08\r
  title: 대륙별계층구조\r
  order: 8\r
  category: plotly\r
  difficulty: ⭐⭐⭐\r
  badge: 중급\r
  tags:\r
  - gapminder\r
  - 트리맵\r
  - 선버스트\r
  - 파이\r
  - 계층구조\r
  seo:\r
    title: Plotly 트리맵과 선버스트 - 대륙별 계층 구조 시각화\r
    description: gapminder 데이터로 Plotly 트리맵과 선버스트 차트를 배웁니다. 대륙>국가 계층 구조를 시각화합니다.\r
    keywords:\r
    - Plotly\r
    - 트리맵\r
    - 선버스트\r
    - 파이차트\r
    - gapminder\r
intro:\r
  emoji: 🌍\r
  goal: 대륙>국가 계층 구조를 시각화합니다.\r
  description: gapminder 2007년 데이터로 파이, 트리맵, 선버스트 차트를 배웁니다. 대륙별 인구 분포와 국가 구성을 계층적으로 표현합니다.\r
  direction: 대륙별계층구조에서 데이터를 상호작용 차트로 구성하고 필터와 표시 상태를 검증합니다.\r
  benefits:\r
  - 대시보드 데이터 확인 후 인터랙티브 시각화에 맞는 코드 입력을 고릅니다.\r
  - 대륙별계층구조 결과를 툴팁과 선택 상태 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 공유 대시보드에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 데이터 준비 입력 확인\r
      detail: 입력 기준(대시보드 데이터)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 대륙별 집계 처리 실행\r
      detail: 인터랙티브 시각화 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 파이 차트 기본 결과 검증\r
      detail: 툴팁과 선택 상태 기준으로 실행 결과를 비교합니다.\r
    - label: 대륙별계층구조 재사용\r
      detail: 완성 코드를 공유 대시보드에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 인터랙티브 차트 환경\r
      detail: pandas, plotly 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 대륙별계층구조 실행\r
      detail: 셀을 실행해 툴팁과 선택 상태와 예외 상태를 확인합니다.\r
    - label: 대륙별계층구조 완료\r
      detail: 검증된 코드를 공유 대시보드로 남깁니다.\r
sections:\r
- id: step1_import\r
  title: 1단계. 데이터 준비\r
  structuredPrimary: true\r
  subtitle: gapminder 2007\r
  goal: 1단계. 데이터 준비에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: gapminder 데이터에서 2007년 자료만 추출합니다. 계층 구조 시각화는 최신 시점의 스냅샷을 보는 것이 효과적이기 때문입니다. 이 데이터에는 대륙(continent)과\r
    국가(country)라는 2단계 계층 구조가 있으며, 인구(pop), 기대수명(lifeExp), GDP(gdpPercap) 같은 수치 정보를 크기나 색상으로 표현할 수 있습니다.\r
    계층 구조를 시각화하면 "전체에서 각 부분이 차지하는 비중"과 "부분들 간의 상대적 크기"를 직관적으로 파악할 수 있어, 시장 점유율, 예산 배분, 인구 분포 같은 비즈니스 데이터\r
    분석에 매우 유용합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import plotly.express as px\r
    import pandas as pd\r
\r
    gapminder = px.data.gapminder()\r
    df2007 = gapminder.query("year == 2007")\r
    df2007.head()\r
  exercise:\r
    prompt: 1단계. 데이터 준비 예제에서 \`gapminder\`, \`df2007\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      import plotly.express as px\r
      import pandas as pd\r
\r
      gapminder = px.data.gapminder()\r
      df2007 = gapminder.query("year == 2007")\r
      df2007.head()\r
    hints:\r
    - 바꿀 지점은 \`gapminder = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`gapminder\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 1단계. 데이터 준비에서 \`gapminder\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 1단계. 데이터 준비 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step2_continent_summary\r
  title: 2단계. 대륙별 집계\r
  structuredPrimary: true\r
  subtitle: 대륙별 인구 합계\r
  goal: 2단계. 대륙별 집계에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 대륙별로 인구를 합산하여 집계 데이터를 만듭니다. 계층 차트는 raw 데이터가 아닌 집계된 요약 데이터를 사용하는 경우가 많기 때문입니다. pandas groupby로\r
    대륙별 인구 총합을 계산하고, 컬럼명을 명확하게 변경(continent, totalPop)하여 가독성을 높입니다. 이 집계 데이터는 파이 차트에서 대륙별 비율을 표현하고, 트리맵에서\r
    대륙 레벨의 크기를 결정하는 데 사용됩니다. 실무에서는 매출, 비용, 인원 수 등 다양한 지표를 집계하여 계층 구조로 시각화하며, 전체 예산에서 부서별 예산 비중을 보여주거나\r
    회사 전체 인력에서 팀별 인원 분포를 표현하는 데 활용됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    continentPop = df2007.groupby('continent')['pop'].sum().reset_index()\r
    continentPop.columns = ['continent', 'totalPop']\r
    continentPop\r
  exercise:\r
    prompt: 2단계. 대륙별 집계 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      continentPop = df2007.groupby('continent')['pop'].sum().reset_index()\r
      continentPop.columns = ['continent', 'totalPop']\r
      continentPop\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 2단계. 대륙별 집계에서 \`continentPop\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 2단계. 대륙별 집계 실행 뒤 \`continentPop\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.\r
- id: step3_pie_basic\r
  title: 3단계. 파이 차트 기본\r
  structuredPrimary: true\r
  subtitle: px.pie()\r
  goal: 3단계. 파이 차트 기본에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 인터랙티브 차트는 사용자가 직접 데이터를 탐색할 수 있는 분석 화면을 만듭니다.\r
  explanation: 'px.pie()는 비율을 원형(파이)으로 표현하는 신규 차트 타입입니다. 전체에서 각 부분이 차지하는 비율을 시각적으로 비교할 때 사용하며, values\r
    파라미터에 수치형 데이터(인구, 매출 등), names 파라미터에 범주형 데이터(대륙명, 제품명 등)를 지정합니다. 각 조각(slice)의 각도는 해당 값의 비율에 비례하며,\r
    마우스를 올리면 절대값과 비율(%)이 함께 표시됩니다. 파이 차트는 항목 수가 5~7개 이하일 때 가장 효과적이며, 너무 많으면 조각이 작아져 구분이 어렵습니다. 실무 활용:\r
    시장 점유율(회사별 매출 비중), 예산 배분(부서별 예산 비율), 트래픽 소스(검색/SNS/직접 유입 비중), 설문조사 결과(찬성/반대/중립 비율) 등에 사용됩니다. 주의사항:\r
    시계열 변화나 절대값 비교에는 막대 그래프가 더 적합하므로, 비율 비교가 핵심일 때만 파이 차트를 선택해야 합니다.'\r
  tips:\r
  - 'px.pie()는 비율을 원형(파이)으로 표현하는 신규 차트 타입입니다. 전체에서 각 부분이 차지하는 비율을 시각적으로 비교할 때 사용하며, values 파라미터에 수치형 데이터(인구,\r
    매출 등), names 파라미터에 범주형 데이터(대륙명, 제품명 등)를 지정합니다. 각 조각(slice)의 각도는 해당 값의 비율에 비례하며, 마우스를 올리면 절대값과 비율(%)이\r
    함께 표시됩니다. 파이 차트는 항목 수가 5~7개 이하일 때 가장 효과적이며, 너무 많으면 조각이 작아져 구분이 어렵습니다. 실무 활용: 시장 점유율(회사별 매출 비중), 예산\r
    배분(부서별 예산 비율), 트래픽 소스(검색/SNS/직접 유입 비중), 설문조사 결과(찬성/반대/중립 비율) 등에 사용됩니다. 주의사항: 시계열 변화나 절대값 비교에는 막대 그래프가\r
    더 적합하므로, 비율 비교가 핵심일 때만 파이 차트를 선택해야 합니다.'\r
  snippet: px.pie(continentPop, values='totalPop', names='continent', title='대륙별 인구 비율')\r
  exercise:\r
    prompt: 3단계. 파이 차트 기본 예제에서 입력값을 바꾸고 마지막 확인 값이 달라지는지 확인하세요.\r
    starterCode: px.pie(continentPop, values='totalPop', names='continent', title='대륙별 인구 비율')\r
    hints:\r
    - 바꿀 지점은 대시보드 데이터을 만드는 첫 줄과 인터랙티브 시각화 줄에서 찾으세요.\r
    - 실행 뒤 툴팁과 선택 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 3단계. 파이 차트 기본의 수정 코드가 인터랙티브 시각화 단계의 마지막 확인 값까지 도달해야 합니다.\r
    resultCheck: 3단계. 파이 차트 기본 실행 결과가 툴팁과 선택 상태 기준으로 바꾼 입력값을 반영해야 합니다.\r
- id: step4_pie_color\r
  title: 4단계. 파이 차트 색상\r
  structuredPrimary: true\r
  subtitle: color 파라미터\r
  goal: 4단계. 파이 차트 색상에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: color 파라미터로 범주별 색상을 자동 지정하여 가독성을 높입니다. 파이 차트는 기본적으로 무지개 색상을 순서대로 할당하지만, color='continent'를\r
    명시적으로 지정하면 Plotly가 대륙별로 일관된 색상 팔레트를 적용하여 다른 차트와 색상을 통일할 수 있습니다. 예를 들어 아시아는 항상 빨강, 유럽은 파랑으로 표현되어 여러\r
    차트를 비교할 때 혼란이 줄어듭니다. 실무에서는 브랜드 컬러나 카테고리별 표준 색상을 지정하여 일관성을 유지합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    px.pie(\r
        continentPop, values='totalPop', names='continent',\r
        color='continent', title='대륙별 인구 (색상)'\r
    )\r
  exercise:\r
    prompt: 4단계. 파이 차트 색상 예제에서 \`continentPop\`, \`values\`, \`color\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      px.pie(\r
          continentPop, values='totalPop', names='continent',\r
          color='continent', title='대륙별 인구 (색상)'\r
      )\r
    hints:\r
    - 바꿀 지점은 \`color = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`color\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 4단계. 파이 차트 색상에서 \`color\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 4단계. 파이 차트 색상 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step5_pie_donut\r
  title: 5단계. 도넛 차트\r
  structuredPrimary: true\r
  subtitle: hole 파라미터\r
  goal: 5단계. 도넛 차트에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: hole 파라미터로 가운데를 비워 도넛 차트(Donut Chart)를 만듭니다. 도넛 차트는 파이 차트와 동일한 데이터를 표현하지만, 중앙에 빈 공간이 있어\r
    더 세련되어 보이고, 그 공간에 총합이나 핵심 지표를 텍스트로 추가할 수 있습니다. hole 값은 0~1 사이로, 0이면 일반 파이 차트, 1이면 완전히 비어 보이지 않으므로\r
    보통 0.3~0.6 사이를 사용합니다. hole=0.4는 반지름의 40%가 비는 것을 의미하며, 실무에서는 0.4~0.5가 가장 많이 사용됩니다. 도넛 차트는 대시보드에서 KPI(핵심\r
    성과 지표)를 표현할 때 인기가 높으며, 중앙에 "총 매출 100억", "전체 고객 10만명" 같은 요약 정보를 배치하여 한눈에 전체와 부분을 동시에 파악할 수 있게 합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    px.pie(\r
        continentPop, values='totalPop', names='continent',\r
        hole=0.4, title='대륙별 인구 (도넛)'\r
    )\r
  exercise:\r
    prompt: 5단계. 도넛 차트 예제에서 \`continentPop\`, \`values\`, \`hole\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      px.pie(\r
          continentPop, values='totalPop', names='continent',\r
          hole=0.4, title='대륙별 인구 (도넛)'\r
      )\r
    hints:\r
    - 바꿀 지점은 \`hole = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`hole\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 5단계. 도넛 차트에서 \`hole\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 5단계. 도넛 차트 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step6_treemap_basic\r
  title: 6단계. 트리맵 기본\r
  structuredPrimary: true\r
  subtitle: px.treemap()\r
  goal: 6단계. 트리맵 기본에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 인터랙티브 차트는 사용자가 직접 데이터를 탐색할 수 있는 분석 화면을 만듭니다.\r
  explanation: 'px.treemap()은 계층 데이터를 중첩 사각형으로 표현하는 신규 차트 타입입니다. 파이 차트와 달리 직사각형 영역을 재귀적으로 분할하여 계층 구조를\r
    표현하며, 공간 효율이 높아 많은 항목을 한 화면에 표시할 수 있습니다. path 파라미터에 계층 순서를 리스트로 지정하며, path=[''continent'']는 1단계 계층(대륙만),\r
    path=[''continent'', ''country'']는 2단계 계층(대륙 > 국가)을 의미합니다. values 파라미터는 각 사각형의 크기를 결정하는 수치형 데이터(인구,\r
    매출 등)를 지정합니다. 사각형을 클릭하면 하위 계층으로 드릴다운(확대)되어 세부 정보를 탐색할 수 있으며, 뒤로 가기 버튼으로 상위 계층으로 돌아갈 수 있습니다. 트리맵은 디스크\r
    사용량 분석(폴더별 용량), 예산 배분(부서 > 팀 > 프로젝트), 제품 카테고리 매출(카테고리 > 브랜드 > SKU), 조직도(회사 > 부서 > 팀) 등 계층적 데이터를 시각화하는\r
    데 매우 효과적입니다. 실무 활용: 파이 차트는 항목 수가 적을 때, 트리맵은 항목 수가 많거나 다단계 계층일 때 선택합니다.'\r
  tips:\r
  - 'px.treemap()은 계층 데이터를 중첩 사각형으로 표현하는 신규 차트 타입입니다. 파이 차트와 달리 직사각형 영역을 재귀적으로 분할하여 계층 구조를 표현하며, 공간 효율이\r
    높아 많은 항목을 한 화면에 표시할 수 있습니다. path 파라미터에 계층 순서를 리스트로 지정하며, path=[''continent'']는 1단계 계층(대륙만), path=[''continent'',\r
    ''country'']는 2단계 계층(대륙 > 국가)을 의미합니다. values 파라미터는 각 사각형의 크기를 결정하는 수치형 데이터(인구, 매출 등)를 지정합니다. 사각형을\r
    클릭하면 하위 계층으로 드릴다운(확대)되어 세부 정보를 탐색할 수 있으며, 뒤로 가기 버튼으로 상위 계층으로 돌아갈 수 있습니다. 트리맵은 디스크 사용량 분석(폴더별 용량),\r
    예산 배분(부서 > 팀 > 프로젝트), 제품 카테고리 매출(카테고리 > 브랜드 > SKU), 조직도(회사 > 부서 > 팀) 등 계층적 데이터를 시각화하는 데 매우 효과적입니다.\r
    실무 활용: 파이 차트는 항목 수가 적을 때, 트리맵은 항목 수가 많거나 다단계 계층일 때 선택합니다.'\r
  snippet: px.treemap(continentPop, path=['continent'], values='totalPop', title='대륙별 인구 트리맵')\r
  exercise:\r
    prompt: 6단계. 트리맵 기본 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: px.treemap(continentPop, path=['continent'], values='totalPop', title='대륙별 인구 트리맵')\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 6단계. 트리맵 기본의 시퀀스 접근이 IndexError 없이 실행되어야 합니다.\r
    resultCheck: 6단계. 트리맵 기본 결과가 바꾼 리스트 값이나 인덱스 기준으로 달라져야 합니다.\r
- id: step7_treemap_hierarchy\r
  title: 7단계. 트리맵 계층\r
  structuredPrimary: true\r
  subtitle: 대륙 > 국가\r
  goal: 7단계. 트리맵 계층에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 인터랙티브 차트는 사용자가 직접 데이터를 탐색할 수 있는 분석 화면을 만듭니다.\r
  explanation: path에 여러 컬럼을 지정해 계층 구조를 표현합니다. path=['continent', 'country']로 2단계 계층을 정의하면 첫 번째 레벨에서 대륙별\r
    사각형이 나타나고, 각 대륙을 클릭하면 하위 레벨인 국가별 사각형이 펼쳐집니다. 이를 드릴다운(drill-down) 기능이라 하며, 사용자가 관심 있는 부분을 클릭하여 세부 정보를\r
    탐색할 수 있게 합니다. 트리맵 좌상단의 경로 표시를 클릭하면 상위 레벨로 돌아가며, 이러한 인터랙티브 기능은 대용량 계층 데이터를 효과적으로 탐색하는 데 필수적입니다. 실무에서는\r
    조직도, 제품 카테고리, 파일 시스템 같은 다단계 계층 데이터를 분석할 때 활용됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: px.treemap(df2007, path=['continent', 'country'], values='pop', title='대륙>국가 트리맵')\r
  exercise:\r
    prompt: 7단계. 트리맵 계층 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: px.treemap(df2007, path=['continent', 'country'], values='pop', title='대륙>국가 트리맵')\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 7단계. 트리맵 계층의 시퀀스 접근이 IndexError 없이 실행되어야 합니다.\r
    resultCheck: 7단계. 트리맵 계층 결과가 바꾼 리스트 값이나 인덱스 기준으로 달라져야 합니다.\r
- id: step8_treemap_color\r
  title: 8단계. 트리맵 색상\r
  structuredPrimary: true\r
  subtitle: color_continuous_scale\r
  goal: 8단계. 트리맵 색상에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: color로 추가 변수를 색상으로 표현하여 트리맵의 정보 밀도를 높입니다. 사각형의 크기는 인구(values='pop')를, 색상은 기대수명(color='lifeExp')을\r
    나타내어 한 차트에서 두 가지 정보를 동시에 전달합니다. color_continuous_scale='RdYlGn'은 Red-Yellow-Green 팔레트로, 기대수명이 낮으면\r
    빨강(Red), 중간이면 노랑(Yellow), 높으면 초록(Green)으로 표시하여 위험-중립-안전의 의미를 직관적으로 전달합니다. 이처럼 크기와 색상을 조합하면 "인구가 많은\r
    국가 중 기대수명이 낮은 곳"처럼 다차원 인사이트를 빠르게 발견할 수 있으며, 실무에서는 매출(크기)과 수익률(색상), 고객 수(크기)와 만족도(색상) 같은 조합을 많이 사용합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    px.treemap(\r
        df2007, path=['continent', 'country'], values='pop',\r
        color='lifeExp', color_continuous_scale='RdYlGn',\r
        title='인구(크기)와 기대수명(색상)'\r
    )\r
  exercise:\r
    prompt: 8단계. 트리맵 색상 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      px.treemap(\r
          df2007, path=['continent', 'country'], values='pop',\r
          color='lifeExp', color_continuous_scale='RdYlGn',\r
          title='인구(크기)와 기대수명(색상)'\r
      )\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 8단계. 트리맵 색상에서 \`color\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 8단계. 트리맵 색상 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step9_sunburst_basic\r
  title: 9단계. 선버스트 기본\r
  structuredPrimary: true\r
  subtitle: px.sunburst()\r
  goal: 9단계. 선버스트 기본에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 인터랙티브 차트는 사용자가 직접 데이터를 탐색할 수 있는 분석 화면을 만듭니다.\r
  explanation: |-\r
    px.sunburst()\r
    px.sunburst()는 계층 데이터를 동심원으로 표현합니다. 안쪽이 상위, 바깥쪽이 하위 계층입니다.\r
  tips:\r
  - px.sunburst() px.sunburst()는 계층 데이터를 동심원으로 표현합니다. 안쪽이 상위, 바깥쪽이 하위 계층입니다.\r
  snippet: px.sunburst(df2007, path=['continent', 'country'], values='pop', title='대륙>국가 선버스트')\r
  exercise:\r
    prompt: 9단계. 선버스트 기본 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: px.sunburst(df2007, path=['continent', 'country'], values='pop', title='대륙>국가 선버스트')\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 9단계. 선버스트 기본의 시퀀스 접근이 IndexError 없이 실행되어야 합니다.\r
    resultCheck: 9단계. 선버스트 기본 결과가 바꾼 리스트 값이나 인덱스 기준으로 달라져야 합니다.\r
- id: step10_sunburst_color\r
  title: 10단계. 선버스트 색상\r
  structuredPrimary: true\r
  subtitle: color_continuous_scale\r
  goal: 10단계. 선버스트 색상에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 선버스트에도 color로 추가 변수를 표현하여 트리맵과 동일하게 다차원 정보를 시각화합니다. 여기서는 인구는 각 조각의 크기로, 1인당 GDP는 색상으로 표현하여\r
    "인구가 많지만 1인당 GDP가 낮은 국가"나 "인구는 적지만 부유한 국가"를 한눈에 파악할 수 있습니다. color_continuous_scale='Blues'는 파란색 계열\r
    단일 팔레트로, 색이 진할수록 GDP가 높음을 나타내며, 경제 지표를 표현할 때 자주 사용됩니다. 선버스트는 원형 구조로 인해 트리맵보다 시각적으로 균형잡혀 보이고, 중앙에서\r
    바깥으로 펼쳐지는 형태가 계층 관계를 더 직관적으로 전달하여 프레젠테이션용으로 선호됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    px.sunburst(\r
        df2007, path=['continent', 'country'], values='pop',\r
        color='gdpPercap', color_continuous_scale='Blues',\r
        title='인구(크기)와 GDP(색상)'\r
    )\r
  exercise:\r
    prompt: 10단계. 선버스트 색상 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      px.sunburst(\r
          df2007, path=['continent', 'country'], values='pop',\r
          color='gdpPercap', color_continuous_scale='Blues',\r
          title='인구(크기)와 GDP(색상)'\r
      )\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 10단계. 선버스트 색상에서 \`color\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 10단계. 선버스트 색상 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step11_comparison\r
  title: 11단계. 차트 비교\r
  structuredPrimary: true\r
  subtitle: 파이 vs 트리맵 vs 선버스트\r
  goal: 11단계. 차트 비교에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 아시아 대륙만 필터링해서 세 차트를 비교하며, 동일한 데이터에 대해 각 차트 타입의 장단점을 파악합니다. 파이 차트는 전체에서 각 국가가 차지하는 비율을 각도로\r
    표현하지만 국가 수가 많으면 조각이 작아져 구분이 어렵고, 트리맵은 직사각형 면적으로 비율을 나타내어 공간 효율이 높고 많은 항목을 표시할 수 있으며, 선버스트는 동심원 형태로\r
    시각적 매력이 뛰어나고 계층 관계를 직관적으로 보여줍니다. 실무에서는 항목 수가 5개 이하면 파이, 10개 이상이면 트리맵이나 선버스트를 선택하며, 프레젠테이션용으로는 선버스트가,\r
    분석 작업에는 트리맵이 더 적합합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    asia = df2007.query("continent == 'Asia'")\r
\r
    figPie = px.pie(asia, values='pop', names='country', title='아시아 국가 파이')\r
    figTreemap = px.treemap(asia, path=['country'], values='pop', title='아시아 국가 트리맵')\r
    figSunburst = px.sunburst(asia, path=['country'], values='pop', title='아시아 국가 선버스트')\r
\r
    figSunburst\r
  exercise:\r
    prompt: 11단계. 차트 비교 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      asia = df2007.query("continent == 'Asia'")\r
\r
      figPie = px.pie(asia, values='pop', names='country', title='아시아 국가 파이')\r
      figTreemap = px.treemap(asia, path=['country'], values='pop', title='아시아 국가 트리맵')\r
      figSunburst = px.sunburst(asia, path=['country'], values='pop', title='아시아 국가 선버스트')\r
\r
      figSunburst\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 11단계. 차트 비교의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 11단계. 차트 비교의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step12_final\r
  title: 12단계. 결과물 완성\r
  structuredPrimary: true\r
  subtitle: 완성된 계층 차트\r
  goal: 12단계. 결과물 완성에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 최종 대륙>국가 계층 차트를 완성합니다. 인구는 조각의 크기로, 기대수명은 RdYlGn 색상 팔레트로 표현하여 두 가지 핵심 지표를 동시에 전달합니다. update_traces(textinfo='label+percent\r
    parent')는 각 조각에 국가명과 상위 레벨 대비 비율을 함께 표시하여 정보 밀도를 높이며, 'percent parent'는 전체가 아닌 부모 노드(대륙) 내에서의 비율을\r
    의미합니다. update_layout(margin=dict(t=50, l=0, r=0, b=0))로 차트 주변 여백을 최소화하여 선버스트가 캔버스를 최대한 활용하도록 하며, 특히\r
    대시보드나 보고서에 삽입할 때 공간 효율성을 극대화합니다. 이렇게 완성된 차트는 세계 인구 구조를 계층적으로 이해하고 기대수명 격차를 시각적으로 파악하는 데 매우 효과적입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    figFinal = px.sunburst(\r
        df2007, path=['continent', 'country'], values='pop',\r
        color='lifeExp', color_continuous_scale='RdYlGn',\r
        title='세계 인구 구조 (2007)'\r
    )\r
    figFinal.update_traces(textinfo='label+percent parent')\r
    figFinal.update_layout(margin=dict(t=50, l=0, r=0, b=0))\r
    figFinal\r
  exercise:\r
    prompt: 12단계. 결과물 완성 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figFinal = px.sunburst(\r
          df2007, path=['continent', 'country'], values='pop',\r
          color='lifeExp', color_continuous_scale='RdYlGn',\r
          title='세계 인구 구조 (2007)'\r
      )\r
      figFinal.update_traces(textinfo='label+percent parent')\r
      figFinal.update_layout(margin=dict(t=50, l=0, r=0, b=0))\r
      figFinal\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 12단계. 결과물 완성의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 12단계. 결과물 완성의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 계층 차트 프로젝트\r
  goal: 실습에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    배운 내용으로 계층 차트를 만들어 실전 분석 능력을 키웁니다. 파이 차트의 hole 파라미터, 트리맵의 다차원 표현, 선버스트의 필터링, 그리고 3단계 계층 구조까지 모든 개념을 종합 활용하며, 각 미션은 실제 데이터 분석 시나리오를 반영하여 구성되었습니다. 완성하면 비율 비교, 계층 구조 시각화, 다변수 분석 등 다양한 상황에서 적절한 차트를 선택하고 커스터마이징할 수 있게 됩니다.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  snippet: |-\r
    import plotly.express as px\r
    import pandas as pd\r
\r
    europeGap = px.data.gapminder()\r
    europeOnly = europeGap.query("year == 2007 and continent == 'Europe'")\r
  exercise:\r
    prompt: 실습 예제에서 \`europeGap\`, \`europeOnly\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      import plotly.express as px\r
      import pandas as pd\r
\r
      europeGap = px.data.gapminder()\r
      europeOnly = europeGap.query("year == 2007 and continent == 'Europe'")\r
    hints:\r
    - 바꿀 지점은 \`europeGap = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`europeGap\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 실습에서 \`europeGap\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 실습 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: summary\r
  title: 정리\r
  blocks:\r
  - type: text\r
    content: 계층 구조 차트를 배웠습니다. 파이 차트로 비율 비교의 기초를 익히고, 트리맵으로 다단계 계층과 공간 효율적 시각화를 마스터했으며, 선버스트로 시각적 매력과 인터랙티브\r
      탐색을 구현했습니다. 각 차트 타입은 데이터 특성과 목적에 따라 선택해야 하며, 실무에서는 항목 수, 계층 깊이, 표현하려는 정보의 종류를 고려하여 최적의 차트를 결정합니다.\r
  - type: list\r
    items:\r
    - px.pie() - 비율 원형 차트\r
    - hole - 도넛 차트\r
    - px.treemap() - 중첩 사각형\r
    - px.sunburst() - 동심원 계층\r
    - path - 계층 순서 지정\r
    - color_continuous_scale - 연속형 색상\r
  - type: text\r
    content: 다음 시간에는 주식 데이터로 시계열 분석을 배웁니다.\r
  goal: 정리에서 대시보드 데이터을 바꿨을 때 툴팁과 선택 상태가 어떻게 달라지는지 확인한다.\r
  why: 인터랙티브 차트는 사용자가 직접 데이터를 탐색할 수 있는 분석 화면을 만듭니다.\r
- id: workflow_validation\r
  title: 13단계. 계층 구조 Figure 검증 루프\r
  structuredPrimary: true\r
  subtitle: 예측 → 실행 → 오류 수정 → 검증 → 실무 변주\r
  goal: 13단계. 계층 구조 Figure 검증 루프에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: |-\r
    트리맵과 선버스트는 부분-전체 관계를 보여 주므로 값 컬럼이 양수인지, 계층 경로가 유지되는지 확인해야 합니다.\r
\r
    계층 차트는 큰 조각이 왜 큰지까지 설명할 수 있어야 하므로 집중도 변주를 함께 보는 것이 좋습니다.\r
  snippet: |-\r
    import plotly.express as px\r
\r
    gapHierarchy = px.data.gapminder()\r
    hierarchy2007 = gapHierarchy.query("year == 2007")\r
    requiredColumns = {"continent", "country", "pop", "lifeExp"}\r
    missingColumns = requiredColumns - set(hierarchy2007.columns)\r
\r
    assert not missingColumns, f"필수 컬럼 누락: {missingColumns}"\r
    assert hierarchy2007["pop"].gt(0).all()\r
    assert hierarchy2007["continent"].nunique() == 5\r
  exercise:\r
    prompt: 13단계. 계층 구조 Figure 검증 루프 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      import plotly.express as px\r
\r
      gapHierarchy = px.data.gapminder()\r
      hierarchy2007 = gapHierarchy.query("year == 2007")\r
      requiredColumns = {"continent", "country", "pop", "lifeExp"}\r
      missingColumns = requiredColumns - set(hierarchy2007.columns)\r
\r
      assert not missingColumns, f"필수 컬럼 누락: {missingColumns}"\r
      assert hierarchy2007["pop"].gt(0).all()\r
      assert hierarchy2007["continent"].nunique() == 5\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 13단계. 계층 구조 Figure 검증 루프에서 \`gapHierarchy\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 13단계. 계층 구조 Figure 검증 루프에서 기대값과 실제 결과가 같으면 검증이 통과하고, 다르면 실패해야 합니다.\r
`;export{e as default};