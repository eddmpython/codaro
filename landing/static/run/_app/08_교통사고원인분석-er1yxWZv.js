var e=`meta:\r
  packages:\r
  - pandas\r
  id: pandas_08\r
  title: 교통사고원인분석\r
  order: 8\r
  category: pandas\r
  difficulty: ⭐⭐⭐⭐\r
  badge: 중급\r
  dataSource: codaro-local:car_crashes\r
  tags:\r
  - car_crashes\r
  - 지역비교\r
  - rank\r
  - 시각화\r
  - heatmap\r
  - 검증\r
  - 지역비교\r
  seo:\r
    title: pandas 지역별 비교 분석 - 미국 교통사고 데이터\r
    description: 미국 주별 교통사고 데이터로 지역 비교를 배웁니다. rank 순위, 상관관계 히트맵, 위험도 점수 계산을 실습합니다.\r
    keywords:\r
    - pandas rank\r
    - 지역비교\r
    - 상관분석\r
    - car_crashes\r
    - 히트맵\r
intro:\r
  emoji: 🚗\r
  goal: 미국 주별 교통사고 데이터에서 "가장 위험한 주는 어디인가?"를 분석합니다.\r
  description: 지역별 비교 분석을 배웁니다. 순위를 매기고, 여러 지표를 종합해서 위험도를 계산합니다.\r
  direction: 교통사고원인분석에서 표 데이터를 불러오고 정제, 집계, 검증 결과까지 연결합니다.\r
  benefits:\r
  - DataFrame 입력 확인 후 정제와 집계에 맞는 코드 입력을 고릅니다.\r
  - 교통사고원인분석 결과를 행/열 수와 요약값 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 데이터 리포트 자동화에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 데이터 불러오기 입력 확인\r
      detail: 입력 기준(DataFrame 입력)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 미리보기 처리 실행\r
      detail: 정제와 집계 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 인덱스 설정 결과 검증\r
      detail: 행/열 수와 요약값 기준으로 실행 결과를 비교합니다.\r
    - label: 교통사고원인분석 재사용\r
      detail: 완성 코드를 데이터 리포트 자동화에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 표 데이터 환경\r
      detail: pandas 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 교통사고원인분석 실행\r
      detail: 셀을 실행해 행/열 수와 요약값와 예외 상태를 확인합니다.\r
    - label: 교통사고원인분석 완료\r
      detail: 검증된 코드를 데이터 리포트 자동화로 남깁니다.\r
sections:\r
- id: step1_load\r
  title: 1단계. 데이터 불러오기\r
  structuredPrimary: true\r
  subtitle: 51개 주 교통사고 통계\r
  goal: 1단계. 데이터 불러오기에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 미국 51개 주(워싱턴DC 포함)의 교통사고 원인별 통계입니다. 로컬 실행에서는 네트워크가 없어도 지역 비교, 순위, 종합 점수 흐름을 연습할 수 있도록 주요\r
    주 약자를 포함한 샘플 데이터를 함께 둡니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import pandas as pd\r
    from codaro.curriculum.localData import loadLocalDataset\r
\r
    crashes = loadLocalDataset("car_crashes")\r
    crashes.shape\r
  exercise:\r
    prompt: 1단계. 데이터 불러오기 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import pandas as pd\r
      from codaro.curriculum.localData import loadLocalDataset\r
\r
      crashes = loadLocalDataset("car_crashes")\r
      crashes.shape\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 1단계. 데이터 불러오기의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 1단계. 데이터 불러오기의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step2_head\r
  title: 2단계. 미리보기\r
  structuredPrimary: true\r
  subtitle: 데이터 구조 파악\r
  goal: 2단계. 미리보기에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: total(총 사고), speeding(과속), alcohol(음주), not_distracted(집중), ins_premium(보험료), abbrev(주\r
    약자)\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: crashes.head()\r
  exercise:\r
    prompt: 2단계. 미리보기 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: crashes.head()\r
    hints:\r
    - 바꿀 지점은 DataFrame 입력을 만드는 첫 줄과 정제와 집계 줄에서 찾으세요.\r
    - 실행 뒤 행/열 수와 요약값 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 2단계. 미리보기의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 2단계. 미리보기의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step3_set_index\r
  title: 3단계. 인덱스 설정\r
  structuredPrimary: true\r
  subtitle: 주 약자를 인덱스로\r
  goal: 3단계. 인덱스 설정에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    주 약자(abbrev)를 인덱스로 설정하면 'CA', 'TX'처럼 이름으로 접근할 수 있습니다. 인덱스를 의미있는 값으로 설정하면 데이터 조회가 직관적이고 편리해집니다.\r
\r
    set_index()는 특정 컬럼을 인덱스로 설정합니다. 인덱스는 각 행을 식별하는 라벨입니다. 기본 인덱스(0, 1, 2...)보다 의미있는 값(주 이름, 날짜 등)을 인덱스로 설정하면 loc으로 직관적인 조회가 가능합니다.\r
  tips:\r
  - set_index()는 특정 컬럼을 인덱스로 설정합니다. 인덱스는 각 행을 식별하는 라벨입니다. 기본 인덱스(0, 1, 2...)보다 의미있는 값(주 이름, 날짜 등)을 인덱스로\r
    설정하면 loc으로 직관적인 조회가 가능합니다.\r
  snippet: |-\r
    indexed = crashes.set_index('abbrev')\r
    indexed.head()\r
  exercise:\r
    prompt: 3단계. 인덱스 설정 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      indexed = crashes.set_index('abbrev')\r
      indexed.head()\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 3단계. 인덱스 설정의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 3단계. 인덱스 설정의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step4_loc\r
  title: 4단계. 특정 주 조회\r
  structuredPrimary: true\r
  subtitle: loc으로 이름 접근\r
  goal: 4단계. 특정 주 조회에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 인덱스를 설정하면 주 이름으로 바로 조회할 수 있습니다. 인덱스 기반 조회는 속도도 빠릅니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: indexed.loc['CA']\r
  exercise:\r
    prompt: 4단계. 특정 주 조회 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: indexed.loc['CA']\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 4단계. 특정 주 조회의 시퀀스 접근이 IndexError 없이 실행되어야 합니다.\r
    resultCheck: 4단계. 특정 주 조회 결과가 바꾼 리스트 값이나 인덱스 기준으로 달라져야 합니다.\r
- id: step5_multi_loc\r
  title: 5단계. 여러 주 비교\r
  structuredPrimary: true\r
  subtitle: 리스트로 여러 행 조회\r
  goal: 5단계. 여러 주 비교에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 리스트를 넣으면 여러 주를 동시에 비교할 수 있습니다. 관심있는 주들만 선택해서 볼 수 있어 편리합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: indexed.loc[['CA', 'TX', 'NY']]\r
  exercise:\r
    prompt: 5단계. 여러 주 비교 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: indexed.loc[['CA', 'TX', 'NY']]\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 5단계. 여러 주 비교의 시퀀스 접근이 IndexError 없이 실행되어야 합니다.\r
    resultCheck: 5단계. 여러 주 비교 결과가 바꾼 리스트 값이나 인덱스 기준으로 달라져야 합니다.\r
- id: step6_rank\r
  title: 6단계. 순위 매기기\r
  structuredPrimary: true\r
  subtitle: rank()\r
  goal: 6단계. 순위 매기기에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    rank()는 값의 순위를 매깁니다. ascending=False로 큰 값이 1위가 됩니다. 순위를 매기면 상대적인 위치를 쉽게 파악할 수 있습니다.\r
\r
    rank()는 값의 순위를 매깁니다. ascending=False면 큰 값이 1위(낮은 순위 번호), True면 작은 값이 1위입니다. 기본값은 True입니다. 동점이 있으면 method 파라미터로 처리 방식을 선택할 수 있습니다(average, min, max 등).\r
  tips:\r
  - rank()는 값의 순위를 매깁니다. ascending=False면 큰 값이 1위(낮은 순위 번호), True면 작은 값이 1위입니다. 기본값은 True입니다. 동점이 있으면\r
    method 파라미터로 처리 방식을 선택할 수 있습니다(average, min, max 등).\r
  snippet: |-\r
    ranked = indexed.copy()\r
    ranked['totalRank'] = ranked['total'].rank(ascending=False)\r
    ranked[['total', 'totalRank']].sort_values('totalRank').head(10)\r
  exercise:\r
    prompt: 6단계. 순위 매기기 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      ranked = indexed.copy()\r
      ranked['totalRank'] = ranked['total'].rank(ascending=False)\r
      ranked[['total', 'totalRank']].sort_values('totalRank').head(10)\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 6단계. 순위 매기기의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 6단계. 순위 매기기의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step7_alcohol_rank\r
  title: 7단계. 음주사고 순위\r
  structuredPrimary: true\r
  subtitle: 다른 지표에도 적용\r
  goal: 7단계. 음주사고 순위에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 음주사고율이 높은 주의 순위를 매깁니다. 여러 지표의 순위를 비교하면 주별 특성을 파악할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    ranked['alcoholRank'] = ranked['alcohol'].rank(ascending=False)\r
    ranked[['alcohol', 'alcoholRank']].sort_values('alcoholRank').head(10)\r
  exercise:\r
    prompt: 7단계. 음주사고 순위 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      ranked['alcoholRank'] = ranked['alcohol'].rank(ascending=False)\r
      ranked[['alcohol', 'alcoholRank']].sort_values('alcoholRank').head(10)\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 7단계. 음주사고 순위의 시퀀스 접근이 IndexError 없이 실행되어야 합니다.\r
    resultCheck: 7단계. 음주사고 순위 결과가 바꾼 리스트 값이나 인덱스 기준으로 달라져야 합니다.\r
- id: step8_corr\r
  title: 8단계. 상관관계 분석\r
  structuredPrimary: true\r
  subtitle: 원인들 사이의 관계\r
  goal: 8단계. 상관관계 분석에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 음주사고가 총 사고율과 0.85로 높은 상관관계를 보입니다. 상관관계 분석으로 어떤 요인들이 함께 움직이는지 파악할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: indexed[['total', 'speeding', 'alcohol', 'not_distracted']].corr()\r
  exercise:\r
    prompt: 8단계. 상관관계 분석 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: indexed[['total', 'speeding', 'alcohol', 'not_distracted']].corr()\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 8단계. 상관관계 분석의 시퀀스 접근이 IndexError 없이 실행되어야 합니다.\r
    resultCheck: 8단계. 상관관계 분석 결과가 바꾼 리스트 값이나 인덱스 기준으로 달라져야 합니다.\r
- id: step9_normalize_func\r
  title: 9단계. 정규화 함수\r
  structuredPrimary: true\r
  subtitle: 0~1 스케일로 변환\r
  goal: 9단계. 정규화 함수에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    여러 지표를 종합하려면 같은 스케일로 맞춰야 합니다. 과속은 0~20, 음주는 0~10처럼 범위가 다르면 단순히 더할 수 없습니다. 모든 값을 0~1 사이로 정규화하면 공정하게 비교할 수 있습니다. Min-Max 정규화 방식을 사용합니다.\r
\r
    함수 정의 (def)\r
    def는 '함수를 정의한다'는 뜻입니다. 함수는 특정 작업을 수행하는 코드 묶음으로, 한 번 정의하면 여러 번 재사용할 수 있습니다. def 함수명(입력값): 형태로 작성하고, return으로 결과를 반환합니다. 아래 코드에서 normalize(series)처럼 함수명과 괄호 안에 입력값을 넣으면 함수가 실행됩니다. 함수를 사용하면 같은 계산을 여러 컬럼에 반복 적용할 때 코드가 깔끔해지고, 수정할 때도 한 곳만 바꾸면 됩니다.\r
  tips:\r
  - '함수 정의 (def) def는 ''함수를 정의한다''는 뜻입니다. 함수는 특정 작업을 수행하는 코드 묶음으로, 한 번 정의하면 여러 번 재사용할 수 있습니다. def 함수명(입력값):\r
    형태로 작성하고, return으로 결과를 반환합니다. 아래 코드에서 normalize(series)처럼 함수명과 괄호 안에 입력값을 넣으면 함수가 실행됩니다. 함수를 사용하면\r
    같은 계산을 여러 컬럼에 반복 적용할 때 코드가 깔끔해지고, 수정할 때도 한 곳만 바꾸면 됩니다.'\r
  snippet: |-\r
    def normalize(series):\r
        return (series - series.min()) / (series.max() - series.min())\r
  exercise:\r
    prompt: 9단계. 정규화 함수 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      def normalize(series):\r
          return (series - series.min()) / (series.max() - series.min())\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 9단계. 정규화 함수의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 9단계. 정규화 함수 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: step10_danger_score\r
  title: 10단계. 위험도 점수 계산\r
  structuredPrimary: true\r
  subtitle: 여러 지표 종합\r
  goal: 10단계. 위험도 점수 계산에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 과속, 음주, 산만 운전을 종합해서 위험도 점수를 계산합니다. not_distracted는 높을수록 안전하므로 1에서 빼서 위험도로 변환합니다. 세 가지를\r
    더한 뒤 3으로 나누면 평균 위험도 점수가 됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    danger = indexed.copy()\r
    danger['dangerScore'] = (\r
        normalize(danger['speeding']) +\r
        normalize(danger['alcohol']) +\r
        (1 - normalize(danger['not_distracted']))\r
    ) / 3\r
    danger[['dangerScore']].sort_values('dangerScore', ascending=False).head(10)\r
  exercise:\r
    prompt: 10단계. 위험도 점수 계산 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      danger = indexed.copy()\r
      danger['dangerScore'] = (\r
          normalize(danger['speeding']) +\r
          normalize(danger['alcohol']) +\r
          (1 - normalize(danger['not_distracted']))\r
      ) / 3\r
      danger[['dangerScore']].sort_values('dangerScore', ascending=False).head(10)\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 10단계. 위험도 점수 계산의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 10단계. 위험도 점수 계산의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step11_top_dangerous\r
  title: 11단계. 가장 위험한 주\r
  structuredPrimary: true\r
  subtitle: nlargest 활용\r
  goal: 11단계. 가장 위험한 주에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 종합 위험도 상위 5개 주를 확인합니다. nlargest는 가장 큰 값을 빠르게 찾습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: danger.nlargest(5, 'dangerScore')[['total', 'speeding', 'alcohol', 'dangerScore']]\r
  exercise:\r
    prompt: 11단계. 가장 위험한 주 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: danger.nlargest(5, 'dangerScore')[['total', 'speeding', 'alcohol', 'dangerScore']]\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 11단계. 가장 위험한 주의 시퀀스 접근이 IndexError 없이 실행되어야 합니다.\r
    resultCheck: 11단계. 가장 위험한 주 결과가 바꾼 리스트 값이나 인덱스 기준으로 달라져야 합니다.\r
- id: step12_safest\r
  title: 12단계. 가장 안전한 주\r
  structuredPrimary: true\r
  subtitle: nsmallest 활용\r
  goal: 12단계. 가장 안전한 주에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    종합 위험도가 가장 낮은 5개 주입니다. nsmallest는 가장 작은 값을 빠르게 찾습니다.\r
\r
    nlargest(n, column)와 nsmallest(n, column)은 특정 컬럼 기준으로 상위/하위 n개 행을 빠르게 찾습니다. sort_values()로 정렬한 뒤 head()를 쓰는 것보다 성능이 좋습니다. 대용량 데이터에서 TOP N을 찾을 때 유용합니다.\r
  tips:\r
  - nlargest(n, column)와 nsmallest(n, column)은 특정 컬럼 기준으로 상위/하위 n개 행을 빠르게 찾습니다. sort_values()로 정렬한 뒤 head()를\r
    쓰는 것보다 성능이 좋습니다. 대용량 데이터에서 TOP N을 찾을 때 유용합니다.\r
  snippet: danger.nsmallest(5, 'dangerScore')[['total', 'speeding', 'alcohol', 'dangerScore']]\r
  exercise:\r
    prompt: 12단계. 가장 안전한 주 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: danger.nsmallest(5, 'dangerScore')[['total', 'speeding', 'alcohol', 'dangerScore']]\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 12단계. 가장 안전한 주의 시퀀스 접근이 IndexError 없이 실행되어야 합니다.\r
    resultCheck: 12단계. 가장 안전한 주 결과가 바꾼 리스트 값이나 인덱스 기준으로 달라져야 합니다.\r
- id: workflow_validation\r
  title: '현업 흐름 검증: 지역별 사고 위험도 산정'\r
  structuredPrimary: true\r
  subtitle: rank, nlargest, nsmallest, 실패 케이스\r
  goal: '현업 흐름 검증: 지역별 사고 위험도 산정에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.'\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: |-\r
    종합 위험 점수는 가중치가 바뀌면 순위가 바뀝니다. 점수 계산식과 상위/하위 지역을 assert로 고정해 리포트 정책을 명확히 하세요.\r
\r
    변주 실험\r
    음주 사고 가중치를 3에서 5로 올리면 가장 위험한 지역이 바뀌는지 확인하세요.\r
  tips:\r
  - 변주 실험 음주 사고 가중치를 3에서 5로 올리면 가장 위험한 지역이 바뀌는지 확인하세요.\r
  snippet: |-\r
    import pandas as pd\r
\r
    crashes = pd.DataFrame({\r
        "state": ["A", "B", "C"],\r
        "total": [20, 12, 18],\r
        "speeding": [5, 2, 7],\r
        "alcohol": [4, 1, 2],\r
    }).set_index("state")\r
\r
    crashes["dangerScore"] = crashes["total"] + crashes["speeding"] * 2 + crashes["alcohol"] * 3\r
    top = crashes.nlargest(1, "dangerScore")\r
    safe = crashes.nsmallest(1, "dangerScore")\r
\r
    assert top.index.tolist() == ["A"]\r
    assert safe.index.tolist() == ["B"]\r
    assert crashes["dangerScore"].rank(ascending=False).loc["A"] == 1\r
  exercise:\r
    prompt: '현업 흐름 검증: 지역별 사고 위험도 산정 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.'\r
    starterCode: |-\r
      import pandas as pd\r
\r
      crashes = pd.DataFrame({\r
          "state": ["A", "B", "C"],\r
          "total": [20, 12, 18],\r
          "speeding": [5, 2, 7],\r
          "alcohol": [4, 1, 2],\r
      }).set_index("state")\r
\r
      crashes["dangerScore"] = crashes["total"] + crashes["speeding"] * 2 + crashes["alcohol"] * 3\r
      top = crashes.nlargest(1, "dangerScore")\r
      safe = crashes.nsmallest(1, "dangerScore")\r
\r
      assert top.index.tolist() == ["A"]\r
      assert safe.index.tolist() == ["B"]\r
      assert crashes["dangerScore"].rank(ascending=False).loc["A"] == 1\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: '현업 흐름 검증: 지역별 사고 위험도 산정의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.'\r
    resultCheck: '현업 흐름 검증: 지역별 사고 위험도 산정의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.'\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 교통안전 분석 프로젝트\r
  goal: 실습에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    교통안전 분석가가 되어 주별 위험도를 분석해봅시다.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  snippet: |-\r
    import pandas as pd\r
    from codaro.curriculum.localData import loadLocalDataset\r
\r
    data = loadLocalDataset("car_crashes")\r
    dataIndexed = data.set_index("abbrev")\r
  exercise:\r
    prompt: 실습 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import pandas as pd\r
      from codaro.curriculum.localData import loadLocalDataset\r
\r
      data = loadLocalDataset("car_crashes")\r
      dataIndexed = data.set_index("abbrev")\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 실습의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 실습의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: summary\r
  title: 정리\r
  subtitle: 중급 과정 완료!\r
  blocks:\r
  - type: text\r
    content: pandas 중급 과정을 모두 마쳤습니다!\r
  - type: list\r
    items:\r
    - set_index() - 의미있는 인덱스 설정\r
    - rank() - 순위 매기기\r
    - 정규화 - 0~1 사이로 스케일 조정\r
    - 종합 점수 - 여러 지표를 하나로\r
  - type: text\r
    content: 다음 시간부터는 심화 과정입니다. 여러 데이터를 합치는 merge를 배웁니다.\r
  goal: 정리에서 DataFrame 입력, 컬럼 선택, 결과 테이블을 연결해 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
`;export{e as default};