var e=`meta:\r
  packages:\r
  - pydantic\r
  id: pydantic_03\r
  title: 중첩모델설계\r
  order: 3\r
  category: pydantic\r
  difficulty: ⭐⭐\r
  badge: 기초\r
  tags:\r
  - pydantic\r
  - nested\r
  - 중첩모델\r
  - 복합타입\r
  - 리스트\r
  seo:\r
    title: Pydantic 중첩 모델 - 복잡한 데이터 구조 설계\r
    description: Pydantic으로 중첩된 모델을 설계합니다. 모델 안의 모델, 리스트, 딕셔너리 타입을 활용합니다.\r
    keywords:\r
    - pydantic\r
    - nested\r
    - 중첩모델\r
    - 복합타입\r
intro:\r
  emoji: 🏗️\r
  goal: 중첩 모델로 E-커머스 주문 시스템을 구축합니다.\r
  description: 실제 서비스에서 데이터는 단순한 구조가 아닙니다. 주문에는 여러 상품이 포함되고, 상품에는 카테고리 정보가 있고, 고객에는 배송지 정보가 있습니다. 이 프로젝트에서는\r
    모델 안에 다른 모델을 포함하고, 리스트와 딕셔너리를 활용하여 실제 API 응답 같은 복잡한 구조를 다룹니다.\r
  direction: 중첩모델설계에서 입력 스키마를 정의하고 검증된 데이터만 처리 흐름에 넘김합니다.\r
  benefits:\r
  - 외부 입력 확인 후 스키마 검증에 맞는 코드 입력을 고릅니다.\r
  - 중첩모델설계 결과를 성공 모델과 오류 메시지 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 API/자동화 입력 계약에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 라이브러리 로드 입력 확인\r
      detail: 입력 기준(외부 입력)과 필요한 조건을 먼저 고정합니다.\r
    - label: 기본 중첩 모델 처리 실행\r
      detail: 스키마 검증 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 모델 리스트 결과 검증\r
      detail: 성공 모델과 오류 메시지 기준으로 실행 결과를 비교합니다.\r
    - label: 중첩모델설계 재사용\r
      detail: 완성 코드를 API/자동화 입력 계약에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 데이터 계약 환경\r
      detail: pydantic 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 중첩모델설계 실행\r
      detail: 셀을 실행해 성공 모델과 오류 메시지와 예외 상태를 확인합니다.\r
    - label: 중첩모델설계 완료\r
      detail: 검증된 코드를 API/자동화 입력 계약로 남깁니다.\r
sections:\r
- id: load\r
  title: 라이브러리 로드\r
  structuredPrimary: true\r
  subtitle: Pydantic import 확인\r
  goal: 라이브러리 로드에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: import 준비가 정확해야 다음 셀과 자동화 코드에서 같은 이름을 안정적으로 재사용할 수 있습니다.\r
  explanation: 중첩 모델은 실제 애플리케이션에서 가장 많이 사용되는 패턴입니다. JSON API 응답, 데이터베이스 관계, 복잡한 설정 파일 등 모두 중첩 구조를 가집니다.\r
    Pydantic은 중첩된 모델도 자동으로 검증하고 변환해주어, 타입 안전성을 유지하면서 복잡한 데이터를 쉽게 다룰 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import pydantic\r
    from typing import Optional, List, Dict, Union\r
    from pydantic import BaseModel, Field, ValidationError\r
  exercise:\r
    prompt: 라이브러리 로드 예제에서 import한 모듈의 별칭이나 바로 이어지는 확인 호출을 바꿔 준비 상태를 확인하세요.\r
    starterCode: |-\r
      import pydantic\r
      from typing import Optional, List, Dict, Union\r
      from pydantic import BaseModel, Field, ValidationError\r
    hints:\r
    - 바꿀 지점은 외부 입력을 만드는 첫 줄과 스키마 검증 줄에서 찾으세요.\r
    - 실행 뒤 성공 모델과 오류 메시지 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 라이브러리 로드의 import 대상 모듈과 별칭이 현재 로컬 환경에서 준비되어야 합니다.\r
    resultCheck: 라이브러리 로드 실행 결과가 성공 모델과 오류 메시지 기준으로 바꾼 입력값을 반영해야 합니다.\r
- id: basic\r
  title: 기본 중첩 모델\r
  structuredPrimary: true\r
  subtitle: 모델 안의 모델\r
  goal: 기본 중첩 모델에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    한 모델의 필드 타입으로 다른 모델을 지정하면 자동으로 중첩 검증됩니다. 딕셔너리를 넘기면 자동으로 해당 모델 인스턴스로 변환되고, 중첩된 모델의 필드도 모두 검증됩니다. 점 표기법으로 깊숙한 필드에도 타입 안전하게 접근할 수 있습니다.\r
\r
    딕셔너리를 넘기면 자동으로 Address 인스턴스로 변환됩니다. 물론 Address 인스턴스를 직접 넘겨도 됩니다.\r
  snippet: |-\r
    class Address(BaseModel):\r
        street: str\r
        city: str\r
        zipCode: str\r
\r
    addr = Address(street="123 Main St", city="Seoul", zipCode="12345")\r
    addr\r
  exercise:\r
    prompt: 기본 중첩 모델 예제에서 \`addr\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      class Address(BaseModel):\r
          street: str\r
          city: str\r
          zipCode: str\r
\r
      addr = Address(street="123 Main St", city="Seoul", zipCode="12345")\r
      addr\r
    hints:\r
    - 바꿀 지점은 \`addr = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`addr\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 기본 중첩 모델에서 \`addr\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 기본 중첩 모델 실행 뒤 \`addr\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: listmodel\r
  title: 모델 리스트\r
  structuredPrimary: true\r
  subtitle: list[Model] 타입\r
  goal: 모델 리스트에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: list[Model] 타입으로 여러 개의 모델을 포함하는 필드를 정의합니다. 주문에 여러 상품이 포함되는 경우처럼, 실제 비즈니스 로직에서 매우 흔한 패턴입니다.\r
    리스트의 각 항목도 자동으로 검증되어 타입 안전성이 보장됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    class OrderItem(BaseModel):\r
        productId: str\r
        name: str\r
        price: float = Field(gt=0)\r
        quantity: int = Field(ge=1)\r
\r
    item = OrderItem(productId="P001", name="Laptop", price=999.99, quantity=1)\r
    item\r
  exercise:\r
    prompt: 모델 리스트 예제에서 \`item\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      class OrderItem(BaseModel):\r
          productId: str\r
          name: str\r
          price: float = Field(gt=0)\r
          quantity: int = Field(ge=1)\r
\r
      item = OrderItem(productId="P001", name="Laptop", price=999.99, quantity=1)\r
      item\r
    hints:\r
    - 바꿀 지점은 \`item = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`item\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 모델 리스트에서 \`item\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 모델 리스트 실행 뒤 \`item\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: optional\r
  title: 선택적 중첩\r
  structuredPrimary: true\r
  subtitle: Optional[Model]\r
  goal: 선택적 중첩에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: Optional[Model]로 중첩 모델을 선택적으로 만들 수 있습니다. 사용자의 프로필 정보가 있을 수도 없을 수도 있는 경우처럼, 비즈니스 로직에 따라\r
    유연하게 설계할 수 있습니다. 기본값으로 None을 지정하면 해당 필드 없이도 모델을 생성할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    class Profile(BaseModel):\r
        bio: str\r
        website: Optional[str] = None\r
\r
    class Member(BaseModel):\r
        memberId: str\r
        name: str\r
        profile: Optional[Profile] = None\r
\r
    minimal = Member(memberId="M001", name="Bob")\r
    minimal\r
  exercise:\r
    prompt: 선택적 중첩 예제에서 모델 필드나 입력 dict 값을 바꾸고 검증/직렬화 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      class Profile(BaseModel):\r
          bio: str\r
          website: Optional[str] = None\r
\r
      class Member(BaseModel):\r
          memberId: str\r
          name: str\r
          profile: Optional[Profile] = None\r
\r
      minimal = Member(memberId="M001", name="Bob")\r
      minimal\r
    hints:\r
    - 바꿀 지점은 모델 필드 선언, 입력 dict, 생성 인자입니다.\r
    - 실행 뒤 model_dump(), 오류 메시지, 반환값이 바꾼 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 선택적 중첩에서 \`minimal\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 선택적 중첩 실행 뒤 \`minimal\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.\r
- id: dict\r
  title: 딕셔너리 타입\r
  structuredPrimary: true\r
  subtitle: dict[str, T]\r
  goal: 딕셔너리 타입에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: dict[str, T] 타입으로 동적 키를 가진 구조를 정의합니다. 메타데이터, 설정 값, 태그 등 키가 미리 정해지지 않은 데이터에 유용합니다. 값 타입도\r
    지정할 수 있어 dict[str, int], dict[str, Model] 등 다양한 형태로 활용됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    class Document(BaseModel):\r
        docId: str\r
        title: str\r
        metadata: dict[str, str]\r
\r
    doc = Document(\r
        docId="D001",\r
        title="Report",\r
        metadata={"author": "Alice", "version": "1.0", "status": "draft"}\r
    )\r
    doc\r
  exercise:\r
    prompt: 딕셔너리 타입 예제에서 모델 필드나 입력 dict 값을 바꾸고 검증/직렬화 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      class Document(BaseModel):\r
          docId: str\r
          title: str\r
          metadata: dict[str, str]\r
\r
      doc = Document(\r
          docId="D001",\r
          title="Report",\r
          metadata={"author": "Alice", "version": "1.0", "status": "draft"}\r
      )\r
      doc\r
    hints:\r
    - 바꿀 지점은 모델 필드 선언, 입력 dict, 생성 인자입니다.\r
    - 실행 뒤 model_dump(), 오류 메시지, 반환값이 바꾼 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 딕셔너리 타입에서 \`doc\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 딕셔너리 타입 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: deep\r
  title: 깊은 중첩\r
  structuredPrimary: true\r
  subtitle: 3단계 이상 구조\r
  goal: 깊은 중첩에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 실제 애플리케이션에서는 3단계 이상의 깊은 중첩도 흔합니다. 회사 > 부서 > 직원 구조처럼 계층적 데이터를 표현할 때 유용합니다. Pydantic은 아무리\r
    깊은 중첩도 자동으로 검증하고, 에러 발생 시 정확한 위치를 알려줍니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    class Employee(BaseModel):\r
        empId: str\r
        name: str\r
        role: str\r
\r
    class Department(BaseModel):\r
        deptId: str\r
        deptName: str\r
        employees: list[Employee]\r
\r
    class Company(BaseModel):\r
        companyId: str\r
        companyName: str\r
        departments: list[Department]\r
\r
    companyData = {\r
        "companyId": "C001",\r
        "companyName": "TechCorp",\r
        "departments": [\r
            {\r
                "deptId": "D001",\r
                "deptName": "Engineering",\r
                "employees": [\r
                    {"empId": "E001", "name": "Alice", "role": "Developer"},\r
                    {"empId": "E002", "name": "Bob", "role": "Designer"}\r
                ]\r
            }\r
        ]\r
    }\r
    company = Company.model_validate(companyData)\r
    company\r
  exercise:\r
    prompt: 깊은 중첩 예제에서 모델 필드나 입력 dict 값을 바꾸고 검증/직렬화 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      class Employee(BaseModel):\r
          empId: str\r
          name: str\r
          role: str\r
\r
      class Department(BaseModel):\r
          deptId: str\r
          deptName: str\r
          employees: list[Employee]\r
\r
      class Company(BaseModel):\r
          companyId: str\r
          companyName: str\r
          departments: list[Department]\r
\r
      companyData = {\r
          "companyId": "C001",\r
          "companyName": "TechCorp",\r
          "departments": [\r
              {\r
                  "deptId": "D001",\r
                  "deptName": "Engineering",\r
                  "employees": [\r
                      {"empId": "E001", "name": "Alice", "role": "Developer"},\r
                      {"empId": "E002", "name": "Bob", "role": "Designer"}\r
                  ]\r
              }\r
          ]\r
      }\r
      company = Company.model_validate(companyData)\r
      company\r
    hints:\r
    - 바꿀 지점은 모델 필드 선언, 입력 dict, 생성 인자입니다.\r
    - 실행 뒤 model_dump(), 오류 메시지, 반환값이 바꾼 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 깊은 중첩에서 \`companyData\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 깊은 중첩 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: selfref\r
  title: 자기 참조 모델\r
  structuredPrimary: true\r
  subtitle: 트리 구조\r
  goal: 자기 참조 모델에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 트리 구조나 연결 리스트처럼 모델이 자기 자신을 참조하는 경우가 있습니다. Python 3.11 이상에서는 문자열로 타입을 지정하거나, 클래스 정의 후 update_forward_refs()를\r
    호출합니다. 카테고리 계층, 댓글 스레드 등에 활용됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    class TreeNode(BaseModel):\r
        value: str\r
        children: list["TreeNode"] = []\r
\r
    treeData = {\r
        "value": "root",\r
        "children": [\r
            {"value": "child1", "children": []},\r
            {"value": "child2", "children": [{"value": "grandchild", "children": []}]}\r
        ]\r
    }\r
    tree = TreeNode.model_validate(treeData)\r
    tree\r
  exercise:\r
    prompt: 자기 참조 모델 예제에서 모델 필드나 입력 dict 값을 바꾸고 검증/직렬화 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      class TreeNode(BaseModel):\r
          value: str\r
          children: list["TreeNode"] = []\r
\r
      treeData = {\r
          "value": "root",\r
          "children": [\r
              {"value": "child1", "children": []},\r
              {"value": "child2", "children": [{"value": "grandchild", "children": []}]}\r
          ]\r
      }\r
      tree = TreeNode.model_validate(treeData)\r
      tree\r
    hints:\r
    - 바꿀 지점은 모델 필드 선언, 입력 dict, 생성 인자입니다.\r
    - 실행 뒤 model_dump(), 오류 메시지, 반환값이 바꾼 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 자기 참조 모델에서 \`treeData\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 자기 참조 모델 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: union\r
  title: Union 타입\r
  structuredPrimary: true\r
  subtitle: 여러 타입 허용\r
  goal: Union[TextMessage, ImageMessage] 같은 다형 필드를 정의하고 Pydantic이 입력을 어떤 순서로 시도해 매칭하는지 확인합니다.\r
  why: 실제 API는 한 필드가 여러 형태를 가질 수 있습니다. Union으로 그 다형성을 모델 수준에서 표현해 두면 호출자가 isinstance 분기 없이 패턴 매칭으로 처리할 수 있습니다.\r
  explanation: Union으로 필드가 여러 타입 중 하나를 가질 수 있게 합니다. 메시지가 텍스트일 수도, 이미지일 수도 있는 경우처럼 다형성이 필요할 때 사용합니다. Pydantic은\r
    순서대로 타입을 시도하여 첫 번째로 성공하는 타입으로 변환합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    class TextContent(BaseModel):\r
        contentType: str = "text"\r
        text: str\r
\r
    class ImageContent(BaseModel):\r
        contentType: str = "image"\r
        url: str\r
        width: int\r
        height: int\r
\r
    class Message(BaseModel):\r
        msgId: str\r
        content: Union[TextContent, ImageContent]\r
\r
    textMsg = Message(msgId="M001", content={"contentType": "text", "text": "Hello!"})\r
    textMsg\r
  exercise:\r
    prompt: Union 타입 예제에서 모델 필드나 입력 dict 값을 바꾸고 검증/직렬화 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      class TextContent(BaseModel):\r
          contentType: str = "text"\r
          text: str\r
\r
      class ImageContent(BaseModel):\r
          contentType: str = "image"\r
          url: str\r
          width: int\r
          height: int\r
\r
      class Message(BaseModel):\r
          msgId: str\r
          content: Union[TextContent, ImageContent]\r
\r
      textMsg = Message(msgId="M001", content={"contentType": "text", "text": "Hello!"})\r
      textMsg\r
    hints:\r
    - 바꿀 지점은 모델 필드 선언, 입력 dict, 생성 인자입니다.\r
    - 실행 뒤 model_dump(), 오류 메시지, 반환값이 바꾼 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: Union 타입의 입력 데이터와 처리 인자가 다음 단계까지 도달해야 합니다.\r
    resultCheck: Union 타입 결과 값이 본문 기대값과 일치해야 합니다.\r
- id: serial\r
  title: 중첩 직렬화\r
  structuredPrimary: true\r
  subtitle: model_dump 옵션\r
  goal: 중첩 직렬화에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 중첩 모델도 자동으로 직렬화됩니다. model_dump()는 중첩된 모델을 딕셔너리로, model_dump_json()은 JSON 문자열로 변환합니다. exclude\r
    옵션으로 특정 필드를 제외하고, by_alias로 별칭을 사용할 수도 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    class Order(BaseModel):\r
        orderId: str\r
        items: list[OrderItem]\r
\r
    order = Order(\r
        orderId="O001",\r
        items=[OrderItem(productId="P001", name="Laptop", price=999.99, quantity=1)],\r
    )\r
    orderDict = order.model_dump()\r
    orderDict\r
  exercise:\r
    prompt: 중첩 직렬화 예제에서 \`orderDict\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      class Order(BaseModel):\r
          orderId: str\r
          items: list[OrderItem]\r
\r
      order = Order(\r
          orderId="O001",\r
          items=[OrderItem(productId="P001", name="Laptop", price=999.99, quantity=1)],\r
      )\r
      orderDict = order.model_dump()\r
      orderDict\r
    hints:\r
    - 바꿀 지점은 \`orderDict = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`orderDict\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 중첩 직렬화에서 \`orderDict\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 중첩 직렬화 실행 뒤 \`orderDict\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: result\r
  title: E-커머스 주문 시스템\r
  structuredPrimary: true\r
  subtitle: 종합 모델 설계\r
  goal: E커머스 주문 시스템에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: 지금까지 배운 중첩 모델, 리스트, Optional, 딕셔너리를 모두 활용하여 실제 E-커머스 서비스에서 사용할 수 있는 주문 시스템을 완성합니다. 고객 정보,\r
    상품 목록, 배송지, 결제 정보를 모두 포함한 복잡한 구조입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    from pydantic import computed_field\r
\r
    class ShippingAddress(BaseModel):\r
        recipient: str\r
        phone: str\r
        address: str\r
        zipCode: str\r
\r
    class CartItem(BaseModel):\r
        productId: str\r
        productName: str\r
        unitPrice: float = Field(gt=0)\r
        quantity: int = Field(ge=1)\r
        discount: float = Field(ge=0, le=100, default=0)\r
\r
        @computed_field\r
        @property\r
        def subtotal(self) -> float:\r
            return self.unitPrice * self.quantity * (1 - self.discount / 100)\r
\r
    class CompleteOrder(BaseModel):\r
        orderId: str\r
        customerId: str\r
        items: list[CartItem] = Field(min_length=1)\r
        shipping: ShippingAddress\r
        couponCode: Optional[str] = None\r
        note: Optional[str] = None\r
\r
        @computed_field\r
        @property\r
        def totalAmount(self) -> float:\r
            return sum(item.subtotal for item in self.items)\r
\r
        @computed_field\r
        @property\r
        def itemCount(self) -> int:\r
            return sum(item.quantity for item in self.items)\r
\r
    fullOrder = CompleteOrder(\r
        orderId="ORD-2024-001",\r
        customerId="C100",\r
        items=[\r
            {"productId": "P001", "productName": "노트북", "unitPrice": 1200000, "quantity": 1, "discount": 10},\r
            {"productId": "P002", "productName": "마우스", "unitPrice": 50000, "quantity": 2}\r
        ],\r
        shipping={"recipient": "홍길동", "phone": "010-1234-5678", "address": "서울시 강남구", "zipCode": "06234"}\r
    )\r
    fullOrder\r
  exercise:\r
    prompt: E커머스 주문 시스템 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      from pydantic import computed_field\r
\r
      class ShippingAddress(BaseModel):\r
          recipient: str\r
          phone: str\r
          address: str\r
          zipCode: str\r
\r
      class CartItem(BaseModel):\r
          productId: str\r
          productName: str\r
          unitPrice: float = Field(gt=0)\r
          quantity: int = Field(ge=1)\r
          discount: float = Field(ge=0, le=100, default=0)\r
\r
          @computed_field\r
          @property\r
          def subtotal(self) -> float:\r
              return self.unitPrice * self.quantity * (1 - self.discount / 100)\r
\r
      class CompleteOrder(BaseModel):\r
          orderId: str\r
          customerId: str\r
          items: list[CartItem] = Field(min_length=1)\r
          shipping: ShippingAddress\r
          couponCode: Optional[str] = None\r
          note: Optional[str] = None\r
\r
          @computed_field\r
          @property\r
          def totalAmount(self) -> float:\r
              return sum(item.subtotal for item in self.items)\r
\r
          @computed_field\r
          @property\r
          def itemCount(self) -> int:\r
              return sum(item.quantity for item in self.items)\r
\r
      fullOrder = CompleteOrder(\r
          orderId="ORD-2024-001",\r
          customerId="C100",\r
          items=[\r
              {"productId": "P001", "productName": "노트북", "unitPrice": 1200000, "quantity": 1, "discount": 10},\r
              {"productId": "P002", "productName": "마우스", "unitPrice": 50000, "quantity": 2}\r
          ],\r
          shipping={"recipient": "홍길동", "phone": "010-1234-5678", "address": "서울시 강남구", "zipCode": "06234"}\r
      )\r
      fullOrder\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: E커머스 주문 시스템의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: E커머스 주문 시스템 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 중첩 모델 프로젝트\r
  goal: 실습에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: |-\r
    지금까지 배운 중첩 모델, 리스트, Optional, Union, computed_field를 활용하여 복잡한 데이터 구조를 설계합니다.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  snippet: |-\r
    from pydantic import BaseModel, Field, computed_field\r
    from typing import Optional\r
\r
    class Author(BaseModel):\r
        authorId: str\r
        name: str\r
        email: str\r
\r
    class CommentItem(BaseModel):\r
        commentId: str\r
        author: Author\r
        content: str\r
        createdAt: str\r
\r
    class BlogPost(BaseModel):\r
        postId: str\r
        title: str\r
        content: str\r
        author: Author\r
        tags: list[str] = []\r
        comments: list[CommentItem] = []\r
        publishedAt: Optional[str] = None\r
\r
        @computed_field\r
        @property\r
        def commentCount(self) -> int:\r
            return len(self.comments)\r
\r
    postData = {\r
        "postId": "P001",\r
        "title": "Pydantic 시작하기",\r
        "content": "Pydantic은 데이터 검증 라이브러리입니다...",\r
        "author": {"authorId": "A001", "name": "Alice", "email": "alice@blog.com"},\r
        "tags": ["python", "pydantic"],\r
        "comments": [\r
            {"commentId": "C001", "author": {"authorId": "A002", "name": "Bob", "email": "bob@mail.com"}, "content": "좋은 글!", "createdAt": "2024-01-15"}\r
        ],\r
        "publishedAt": "2024-01-14"\r
    }\r
    post = BlogPost.model_validate(postData)\r
    post\r
  exercise:\r
    prompt: 실습 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      from pydantic import BaseModel, Field, computed_field\r
      from typing import Optional\r
\r
      class Author(BaseModel):\r
          authorId: str\r
          name: str\r
          email: str\r
\r
      class CommentItem(BaseModel):\r
          commentId: str\r
          author: Author\r
          content: str\r
          createdAt: str\r
\r
      class BlogPost(BaseModel):\r
          postId: str\r
          title: str\r
          content: str\r
          author: Author\r
          tags: list[str] = []\r
          comments: list[CommentItem] = []\r
          publishedAt: Optional[str] = None\r
\r
          @computed_field\r
          @property\r
          def commentCount(self) -> int:\r
              return len(self.comments)\r
\r
      postData = {\r
          "postId": "P001",\r
          "title": "Pydantic 시작하기",\r
          "content": "Pydantic은 데이터 검증 라이브러리입니다...",\r
          "author": {"authorId": "A001", "name": "Alice", "email": "alice@blog.com"},\r
          "tags": ["python", "pydantic"],\r
          "comments": [\r
              {"commentId": "C001", "author": {"authorId": "A002", "name": "Bob", "email": "bob@mail.com"}, "content": "좋은 글!", "createdAt": "2024-01-15"}\r
          ],\r
          "publishedAt": "2024-01-14"\r
      }\r
      post = BlogPost.model_validate(postData)\r
      post\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 실습의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 실습 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: workflow_validation\r
  title: '현업 흐름 검증: 주문 입력 계약과 배치 검증'\r
  structuredPrimary: true\r
  subtitle: 예측 → 검증 실패 확인 → 정제 → 결과 검증 → 실무 변주\r
  goal: '현업 흐름 검증: 주문 입력 계약과 배치 검증에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.'\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: Pydantic은 모델을 만드는 데서 끝나지 않고, 외부 입력을 업무 계약으로 바꾸고 실패 이유를 구조화하는 데서 가치가 큽니다. 여기서는 주문 입력을 검증하고,\r
    잘못된 행을 분리한 뒤, 정상 데이터만 다음 단계로 넘기는 흐름을 검증합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    from typing import Literal\r
    from pydantic import BaseModel, Field, ValidationError, computed_field, field_validator\r
\r
    class OrderInput(BaseModel):\r
        orderId: str\r
        customer: str\r
        amount: int = Field(gt=0)\r
        status: Literal['paid', 'pending', 'cancelled']\r
\r
        @field_validator('orderId', 'customer')\r
        @classmethod\r
        def stripRequiredText(cls, value):\r
            cleaned = value.strip()\r
            if not cleaned:\r
                raise ValueError('text field must not be empty')\r
            return cleaned\r
\r
        @computed_field\r
        @property\r
        def isRevenue(self) -> bool:\r
            return self.status == 'paid'\r
\r
    validOrder = OrderInput.model_validate({\r
        'orderId': ' A-100 ',\r
        'customer': ' kim ',\r
        'amount': '120000',\r
        'status': 'paid',\r
    })\r
\r
    assert validOrder.orderId == 'A-100'\r
    assert validOrder.amount == 120000\r
    assert validOrder.isRevenue is True\r
    validOrder.model_dump()\r
  exercise:\r
    prompt: '현업 흐름 검증: 주문 입력 계약과 배치 검증 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.'\r
    starterCode: |-\r
      from typing import Literal\r
      from pydantic import BaseModel, Field, ValidationError, computed_field, field_validator\r
\r
      class OrderInput(BaseModel):\r
          orderId: str\r
          customer: str\r
          amount: int = Field(gt=0)\r
          status: Literal['paid', 'pending', 'cancelled']\r
\r
          @field_validator('orderId', 'customer')\r
          @classmethod\r
          def stripRequiredText(cls, value):\r
              cleaned = value.strip()\r
              if not cleaned:\r
                  raise ValueError('text field must not be empty')\r
              return cleaned\r
\r
          @computed_field\r
          @property\r
          def isRevenue(self) -> bool:\r
              return self.status == 'paid'\r
\r
      validOrder = OrderInput.model_validate({\r
          'orderId': ' A-100 ',\r
          'customer': ' kim ',\r
          'amount': '120000',\r
          'status': 'paid',\r
      })\r
\r
      assert validOrder.orderId == 'A-100'\r
      assert validOrder.amount == 120000\r
      assert validOrder.isRevenue is True\r
      validOrder.model_dump()\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: '현업 흐름 검증: 주문 입력 계약과 배치 검증의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.'\r
    resultCheck: '현업 흐름 검증: 주문 입력 계약과 배치 검증 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.'\r
`;export{e as default};