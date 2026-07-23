var e=`meta:\r
  packages:\r
  - pandas\r
  id: pandas_09\r
  title: 두데이터합치기\r
  order: 9\r
  category: pandas\r
  difficulty: ⭐⭐⭐⭐⭐\r
  badge: 심화\r
  tags:\r
  - merge\r
  - concat\r
  - join\r
  - 병합\r
  - 실무\r
  - 검증\r
  - 데이터결합\r
  seo:\r
    title: pandas merge, concat 완전정복 - 데이터 합치기\r
    description: 여러 데이터프레임을 합치는 방법을 배웁니다. concat으로 세로/가로 연결, merge로 키 기준 병합, left/right/outer join을 실습합니다.\r
    keywords:\r
    - pandas merge\r
    - concat\r
    - join\r
    - 데이터 병합\r
    - left join\r
intro:\r
  emoji: 🔗\r
  goal: 여러 개의 데이터프레임을 하나로 합치는 방법을 배웁니다.\r
  description: 실무에서는 데이터가 여러 파일에 나눠져 있습니다. 고객 정보, 주문 정보, 상품 정보를 합쳐야 분석이 가능합니다.\r
  direction: 두데이터합치기에서 표 데이터를 불러오고 정제, 집계, 검증 결과까지 연결합니다.\r
  benefits:\r
  - DataFrame 입력 확인 후 정제와 집계에 맞는 코드 입력을 고릅니다.\r
  - 두데이터합치기 결과를 행/열 수와 요약값 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 데이터 리포트 자동화에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 고객 데이터 생성 입력 확인\r
      detail: 입력 기준(DataFrame 입력)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 주문 데이터 생성 처리 실행\r
      detail: 정제와 집계 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 상품 데이터 생성 결과 검증\r
      detail: 행/열 수와 요약값 기준으로 실행 결과를 비교합니다.\r
    - label: 두데이터합치기 재사용\r
      detail: 완성 코드를 데이터 리포트 자동화에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 표 데이터 환경\r
      detail: pandas 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 두데이터합치기 실행\r
      detail: 셀을 실행해 행/열 수와 요약값와 예외 상태를 확인합니다.\r
    - label: 두데이터합치기 완료\r
      detail: 검증된 코드를 데이터 리포트 자동화로 남깁니다.\r
sections:\r
- id: step1_customers\r
  title: 1단계. 고객 데이터 생성\r
  structuredPrimary: true\r
  subtitle: 학습용 데이터 준비\r
  goal: 1단계. 고객 데이터 생성에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 온라인 쇼핑몰 데이터를 예로 들어봅시다. 먼저 고객 정보를 만듭니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import pandas as pd\r
\r
    customers = pd.DataFrame({\r
        'customerId': [1, 2, 3, 4],\r
        'name': ['김철수', '이영희', '박민수', '최지은'],\r
        'grade': ['VIP', '일반', 'VIP', '일반']\r
    })\r
    customers\r
  exercise:\r
    prompt: 1단계. 고객 데이터 생성 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import pandas as pd\r
\r
      customers = pd.DataFrame({\r
          'customerId': [1, 2, 3, 4],\r
          'name': ['김철수', '이영희', '박민수', '최지은'],\r
          'grade': ['VIP', '일반', 'VIP', '일반']\r
      })\r
      customers\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 1단계. 고객 데이터 생성의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 1단계. 고객 데이터 생성의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step2_orders\r
  title: 2단계. 주문 데이터 생성\r
  structuredPrimary: true\r
  subtitle: 주문 정보 만들기\r
  goal: 2단계. 주문 데이터 생성에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 주문 데이터를 만듭니다. 각 주문에는 주문번호, 고객번호, 상품번호, 수량이 포함됩니다. 여기서 중요한 점은 customerId=5가 고객 테이블에 없는 값이라는\r
    것입니다. 이런 불일치 데이터는 실무에서 자주 발생하며, 병합 방식(inner, left, outer)에 따라 처리가 달라집니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    orders = pd.DataFrame({\r
        'orderId': [101, 102, 103, 104, 105],\r
        'customerId': [1, 2, 1, 3, 5],\r
        'productId': ['A', 'B', 'A', 'C', 'B'],\r
        'quantity': [2, 1, 3, 1, 2]\r
    })\r
    orders\r
  exercise:\r
    prompt: 2단계. 주문 데이터 생성 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      orders = pd.DataFrame({\r
          'orderId': [101, 102, 103, 104, 105],\r
          'customerId': [1, 2, 1, 3, 5],\r
          'productId': ['A', 'B', 'A', 'C', 'B'],\r
          'quantity': [2, 1, 3, 1, 2]\r
      })\r
      orders\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 2단계. 주문 데이터 생성의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 2단계. 주문 데이터 생성의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step3_products\r
  title: 3단계. 상품 데이터 생성\r
  structuredPrimary: true\r
  subtitle: 상품 정보 만들기\r
  goal: 3단계. 상품 데이터 생성에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 상품 정보를 만듭니다. productId가 주문 테이블의 productId와 연결되는 키 역할을 합니다. 이렇게 여러 테이블이 공통 키로 연결되는 구조를 관계형\r
    데이터베이스 모델이라고 합니다. 고객-주문-상품 세 테이블을 합치면 "누가 무엇을 얼마나 샀는지" 전체 그림을 볼 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    products = pd.DataFrame({\r
        'productId': ['A', 'B', 'C'],\r
        'productName': ['노트북', '마우스', '키보드'],\r
        'price': [1500000, 50000, 100000]\r
    })\r
    products\r
  exercise:\r
    prompt: 3단계. 상품 데이터 생성 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      products = pd.DataFrame({\r
          'productId': ['A', 'B', 'C'],\r
          'productName': ['노트북', '마우스', '키보드'],\r
          'price': [1500000, 50000, 100000]\r
      })\r
      products\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 3단계. 상품 데이터 생성의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 3단계. 상품 데이터 생성의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step4_concat\r
  title: 4단계. concat 기본\r
  structuredPrimary: true\r
  subtitle: 세로로 단순 연결\r
  goal: 4단계. concat 기본에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    concat은 같은 구조의 데이터를 단순히 붙입니다. 1월 주문 + 2월 주문 합치기처럼 같은 형태의 데이터를 이어붙일 때 사용합니다. ignore_index=True로 인덱스를 새로 부여합니다.\r
\r
    pd.concat()은 여러 DataFrame을 연결합니다. 리스트로 DataFrame들을 넘기면 세로로 이어붙입니다(axis=0, 기본값). ignore_index=True로 인덱스를 0부터 다시 부여합니다. axis=1로 설정하면 가로로 붙입니다.\r
  tips:\r
  - pd.concat()은 여러 DataFrame을 연결합니다. 리스트로 DataFrame들을 넘기면 세로로 이어붙입니다(axis=0, 기본값). ignore_index=True로\r
    인덱스를 0부터 다시 부여합니다. axis=1로 설정하면 가로로 붙입니다.\r
  snippet: |-\r
    jan = pd.DataFrame({'orderId': [1, 2], 'amount': [10000, 20000]})\r
    feb = pd.DataFrame({'orderId': [3, 4], 'amount': [15000, 25000]})\r
\r
    pd.concat([jan, feb], ignore_index=True)\r
  exercise:\r
    prompt: 4단계. concat 기본 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      jan = pd.DataFrame({'orderId': [1, 2], 'amount': [10000, 20000]})\r
      feb = pd.DataFrame({'orderId': [3, 4], 'amount': [15000, 25000]})\r
\r
      pd.concat([jan, feb], ignore_index=True)\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 4단계. concat 기본의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 4단계. concat 기본의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step5_merge_inner\r
  title: 5단계. merge 기본 (inner)\r
  structuredPrimary: true\r
  subtitle: 키 기준 병합\r
  goal: 5단계. merge 기본 (inner)에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    merge는 공통 키를 기준으로 합칩니다. SQL의 JOIN과 같은 개념입니다. 기본은 inner join으로 양쪽 모두에 있는 키만 결과에 포함됩니다. customerId=5는 고객 테이블에 없으므로 제외됩니다.\r
\r
    pd.merge()는 공통 키 컬럼을 기준으로 두 DataFrame을 병합합니다. on 파라미터로 키 컬럼을 지정합니다. 기본은 how='inner'로 양쪽 모두에 존재하는 키만 남깁니다. concat은 단순 연결, merge는 키 기준 병합입니다.\r
  tips:\r
  - pd.merge()는 공통 키 컬럼을 기준으로 두 DataFrame을 병합합니다. on 파라미터로 키 컬럼을 지정합니다. 기본은 how='inner'로 양쪽 모두에 존재하는 키만\r
    남깁니다. concat은 단순 연결, merge는 키 기준 병합입니다.\r
  snippet: pd.merge(orders, customers, on='customerId')\r
  exercise:\r
    prompt: 5단계. merge 기본 (inner) 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: pd.merge(orders, customers, on='customerId')\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 5단계. merge 기본 (inner)의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 5단계. merge 기본 (inner) 실행 결과가 행/열 수와 요약값 기준으로 바꾼 열 이름이나 행 값을 반영해야 합니다.\r
- id: step6_merge_product\r
  title: 6단계. 상품 정보 병합\r
  structuredPrimary: true\r
  subtitle: 여러 테이블 합치기\r
  goal: 6단계. 상품 정보 병합에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 여러 테이블을 연속으로 합칠 수 있습니다. 먼저 주문과 고객을 합치고, 그 결과에 상품을 합칩니다. 실무에서 여러 테이블을 조인하는 패턴입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    merged = pd.merge(orders, customers, on='customerId')\r
    full = pd.merge(merged, products, on='productId')\r
    full\r
  exercise:\r
    prompt: 6단계. 상품 정보 병합 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      merged = pd.merge(orders, customers, on='customerId')\r
      full = pd.merge(merged, products, on='productId')\r
      full\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 6단계. 상품 정보 병합의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 6단계. 상품 정보 병합의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step7_calculate\r
  title: 7단계. 금액 계산\r
  structuredPrimary: true\r
  subtitle: 병합 후 계산\r
  goal: 7단계. 금액 계산에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 합쳐진 데이터로 주문 금액을 계산합니다. merge를 통해 필요한 정보를 모았으므로 이제 계산이 가능합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    priced = full.copy()\r
    priced['totalPrice'] = priced['quantity'] * priced['price']\r
    priced[['orderId', 'name', 'productName', 'quantity', 'totalPrice']]\r
  exercise:\r
    prompt: 7단계. 금액 계산 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      priced = full.copy()\r
      priced['totalPrice'] = priced['quantity'] * priced['price']\r
      priced[['orderId', 'name', 'productName', 'quantity', 'totalPrice']]\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 7단계. 금액 계산의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 7단계. 금액 계산의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step8_left_join\r
  title: 8단계. left join\r
  structuredPrimary: true\r
  subtitle: 왼쪽 데이터 모두 유지\r
  goal: 8단계. left join에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    how='left'는 왼쪽 데이터를 모두 유지하고, 오른쪽에 없으면 NaN을 채웁니다. 모든 주문을 유지하면서 고객 정보를 붙이고 싶을 때 사용합니다. customerId=5는 고객이 없지만 주문은 남아있습니다.\r
\r
    how='left'는 왼쪽 DataFrame의 모든 행을 유지합니다. 오른쪽에 매칭되는 키가 없으면 NaN으로 채웁니다. how='right'는 반대로 오른쪽을 유지, how='outer'는 양쪽 모두 유지, how='inner'(기본값)는 양쪽 모두 존재하는 것만 유지합니다.\r
  tips:\r
  - how='left'는 왼쪽 DataFrame의 모든 행을 유지합니다. 오른쪽에 매칭되는 키가 없으면 NaN으로 채웁니다. how='right'는 반대로 오른쪽을 유지, how='outer'는\r
    양쪽 모두 유지, how='inner'(기본값)는 양쪽 모두 존재하는 것만 유지합니다.\r
  snippet: pd.merge(orders, customers, on='customerId', how='left')\r
  exercise:\r
    prompt: 8단계. left join 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: pd.merge(orders, customers, on='customerId', how='left')\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 8단계. left join의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 8단계. left join 실행 결과가 행/열 수와 요약값 기준으로 바꾼 열 이름이나 행 값을 반영해야 합니다.\r
- id: step9_right_join\r
  title: 9단계. right join\r
  structuredPrimary: true\r
  subtitle: 오른쪽 데이터 모두 유지\r
  goal: 9단계. right join에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: how='right'는 오른쪽 DataFrame의 모든 행을 유지합니다. 왼쪽에 매칭되는 키가 없으면 NaN으로 채웁니다. 이 경우 모든 고객을 유지하면서\r
    주문 정보를 붙이므로, 주문이 없는 고객도 결과에 포함됩니다. left join의 반대 개념입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: pd.merge(orders, customers, on='customerId', how='right')\r
  exercise:\r
    prompt: 9단계. right join 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: pd.merge(orders, customers, on='customerId', how='right')\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 9단계. right join의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 9단계. right join 실행 결과가 행/열 수와 요약값 기준으로 바꾼 열 이름이나 행 값을 반영해야 합니다.\r
- id: step10_outer_join\r
  title: 10단계. outer join\r
  structuredPrimary: true\r
  subtitle: 양쪽 모두 유지\r
  goal: 10단계. outer join에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: how='outer'는 양쪽 DataFrame의 모든 행을 유지합니다. 주문이 있지만 고객 정보가 없는 경우(customerId=5), 고객 정보는 있지만\r
    주문이 없는 경우(customerId=4) 모두 결과에 포함됩니다. 데이터 검증이나 불일치 찾기에 유용합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: pd.merge(orders, customers, on='customerId', how='outer')\r
  exercise:\r
    prompt: 10단계. outer join 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: pd.merge(orders, customers, on='customerId', how='outer')\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 10단계. outer join의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 10단계. outer join 실행 결과가 행/열 수와 요약값 기준으로 바꾼 열 이름이나 행 값을 반영해야 합니다.\r
- id: step11_diff_keys\r
  title: 11단계. 다른 키 이름\r
  structuredPrimary: true\r
  subtitle: left_on, right_on\r
  goal: 11단계. 다른 키 이름에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 실무에서는 두 테이블의 키 컬럼 이름이 다른 경우가 많습니다. 예를 들어 한 테이블은 customerId, 다른 테이블은 custId를 사용할 수 있습니다.\r
    이때 left_on과 right_on으로 각각의 키 컬럼을 지정합니다. 병합 후 두 컬럼이 모두 남으므로 필요시 drop()으로 정리합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    diffCust = customers.rename(columns={'customerId': 'custId'})\r
    pd.merge(orders, diffCust, left_on='customerId', right_on='custId')\r
  exercise:\r
    prompt: 11단계. 다른 키 이름 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      diffCust = customers.rename(columns={'customerId': 'custId'})\r
      pd.merge(orders, diffCust, left_on='customerId', right_on='custId')\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 11단계. 다른 키 이름의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 11단계. 다른 키 이름의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step12_multi_keys\r
  title: 12단계. 여러 키로 병합\r
  structuredPrimary: true\r
  subtitle: 복수 컬럼 매칭\r
  goal: 12단계. 여러 키로 병합에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 하나의 컬럼만으로 고유하게 식별할 수 없을 때 여러 컬럼을 키로 사용합니다. 예를 들어 연도와 월의 조합으로 월별 실적과 목표를 매칭합니다. on 파라미터에\r
    리스트로 여러 컬럼을 전달하면 모든 컬럼이 일치하는 경우에만 병합됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    sales = pd.DataFrame({'year': [2023, 2023, 2024], 'month': [1, 2, 1], 'sales': [100, 150, 120]})\r
    targets = pd.DataFrame({'year': [2023, 2023, 2024], 'month': [1, 2, 1], 'target': [90, 140, 130]})\r
\r
    pd.merge(sales, targets, on=['year', 'month'])\r
  exercise:\r
    prompt: 12단계. 여러 키로 병합 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      sales = pd.DataFrame({'year': [2023, 2023, 2024], 'month': [1, 2, 1], 'sales': [100, 150, 120]})\r
      targets = pd.DataFrame({'year': [2023, 2023, 2024], 'month': [1, 2, 1], 'target': [90, 140, 130]})\r
\r
      pd.merge(sales, targets, on=['year', 'month'])\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 12단계. 여러 키로 병합의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 12단계. 여러 키로 병합의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: workflow_validation\r
  title: '현업 흐름 검증: 주문과 고객 테이블 안전하게 병합하기'\r
  structuredPrimary: true\r
  subtitle: merge, validate, indicator, 실패 케이스\r
  goal: '현업 흐름 검증: 주문과 고객 테이블 안전하게 병합하기에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.'\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: |-\r
    데이터 병합은 행 수가 늘거나 줄어도 겉으로는 성공처럼 보입니다. 키 중복, 미매칭 행, 병합 후 합계 보존을 반드시 검증하세요.\r
\r
    변주 실험\r
    left join에서 \`_merge == left_only\`가 있는 주문을 별도 오류 리포트로 분리하고, 누락 고객 수를 assert로 고정하세요.\r
  tips:\r
  - 변주 실험 left join에서 \`_merge == left_only\`가 있는 주문을 별도 오류 리포트로 분리하고, 누락 고객 수를 assert로 고정하세요.\r
  snippet: |-\r
    import pandas as pd\r
\r
    orders = pd.DataFrame({\r
        "orderId": ["O-1", "O-2"],\r
        "customerId": [1, 2],\r
        "amount": [12000, 8000],\r
    })\r
    customers = pd.DataFrame({\r
        "customerId": [1, 2],\r
        "segment": ["vip", "standard"],\r
    })\r
\r
    merged = orders.merge(customers, on="customerId", how="left", validate="many_to_one", indicator=True)\r
    if not merged["_merge"].eq("both").all():\r
        raise ValueError("all orders must match a customer")\r
\r
    assert len(merged) == len(orders)\r
    assert merged["_merge"].eq("both").all()\r
    assert merged["amount"].sum() == orders["amount"].sum()\r
    assert merged.loc[merged["orderId"] == "O-1", "segment"].iloc[0] == "vip"\r
  exercise:\r
    prompt: '현업 흐름 검증: 주문과 고객 테이블 안전하게 병합하기 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.'\r
    starterCode: |-\r
      import pandas as pd\r
\r
      orders = pd.DataFrame({\r
          "orderId": ["O-1", "O-2"],\r
          "customerId": [1, 2],\r
          "amount": [12000, 8000],\r
      })\r
      customers = pd.DataFrame({\r
          "customerId": [1, 2],\r
          "segment": ["vip", "standard"],\r
      })\r
\r
      merged = orders.merge(customers, on="customerId", how="left", validate="many_to_one", indicator=True)\r
      if not merged["_merge"].eq("both").all():\r
          raise ValueError("all orders must match a customer")\r
\r
      assert len(merged) == len(orders)\r
      assert merged["_merge"].eq("both").all()\r
      assert merged["amount"].sum() == orders["amount"].sum()\r
      assert merged.loc[merged["orderId"] == "O-1", "segment"].iloc[0] == "vip"\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: '현업 흐름 검증: 주문과 고객 테이블 안전하게 병합하기의 조건식과 들여쓰기가 맞아 선택한 분기가 실행되어야 합니다.'\r
    resultCheck: '현업 흐름 검증: 주문과 고객 테이블 안전하게 병합하기 분기 결과가 바꾼 조건값에 맞게 달라져야 합니다.'\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 데이터 병합 프로젝트\r
  goal: 실습에서 정제와 집계 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    배운 내용으로 데이터를 병합해봅시다.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  snippet: |-\r
    import pandas as pd\r
    data = pd.DataFrame({\r
        'customerId': [1, 2, 3, 4],\r
        'name': ['김철수', '이영희', '박민수', '최지은'],\r
        'grade': ['VIP', '일반', 'VIP', '일반']\r
    })\r
    dataOrders = pd.DataFrame({\r
        'orderId': [101, 102, 103, 104, 105],\r
        'customerId': [1, 2, 1, 3, 5],\r
        'productId': ['A', 'B', 'A', 'C', 'B'],\r
        'quantity': [2, 1, 3, 1, 2]\r
    })\r
  exercise:\r
    prompt: 실습 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import pandas as pd\r
      data = pd.DataFrame({\r
          'customerId': [1, 2, 3, 4],\r
          'name': ['김철수', '이영희', '박민수', '최지은'],\r
          'grade': ['VIP', '일반', 'VIP', '일반']\r
      })\r
      dataOrders = pd.DataFrame({\r
          'orderId': [101, 102, 103, 104, 105],\r
          'customerId': [1, 2, 1, 3, 5],\r
          'productId': ['A', 'B', 'A', 'C', 'B'],\r
          'quantity': [2, 1, 3, 1, 2]\r
      })\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 실습의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 실습의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: summary\r
  title: 정리\r
  blocks:\r
  - type: text\r
    content: 데이터 병합을 배웠습니다.\r
  - type: list\r
    items:\r
    - concat() - 같은 구조의 데이터를 단순 연결\r
    - merge() - 키 기준으로 데이터 병합\r
    - how='left' - 왼쪽 데이터 모두 유지\r
    - how='outer' - 양쪽 데이터 모두 유지\r
    - on, left_on, right_on - 병합 키 지정\r
  - type: text\r
    content: 다음 시간에는 지금까지 배운 모든 것을 활용하는 실전 프로젝트입니다.\r
  goal: 정리에서 DataFrame 입력, 컬럼 선택, 결과 테이블을 연결해 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
`;export{e as default};