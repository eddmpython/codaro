var e=`meta:
  packages:
  - pydantic
  id: pydantic_03
  title: 중첩모델설계
  order: 3
  category: pydantic
  difficulty: ⭐⭐
  badge: 기초
  tags:
  - pydantic
  - nested
  - 중첩모델
  - 복합타입
  - 리스트
  seo:
    title: Pydantic 중첩 모델 - 복잡한 데이터 구조 설계
    description: Pydantic으로 중첩된 모델을 설계합니다. 모델 안의 모델, 리스트, 딕셔너리 타입을 활용합니다.
    keywords:
    - pydantic
    - nested
    - 중첩모델
    - 복합타입
intro:
  emoji: 🏗️
  goal: 중첩 모델로 E-커머스 주문 시스템을 구축합니다.
  description: 실제 서비스에서 데이터는 단순한 구조가 아닙니다. 주문에는 여러 상품이 포함되고, 상품에는 카테고리 정보가 있고, 고객에는 배송지 정보가 있습니다. 이 프로젝트에서는
    모델 안에 다른 모델을 포함하고, 리스트와 딕셔너리를 활용하여 실제 API 응답 같은 복잡한 구조를 다룹니다.
  direction: 중첩모델설계에서 입력 스키마를 정의하고 검증된 데이터만 처리 흐름에 넘김합니다.
  benefits:
  - 외부 입력 확인 후 스키마 검증에 맞는 코드 입력을 고릅니다.
  - 중첩모델설계 결과를 성공 모델과 오류 메시지 기준으로 즉시 점검합니다.
  - 완료한 코드를 API/자동화 입력 계약에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: 라이브러리 로드 입력 확인
      detail: 입력 기준(외부 입력)과 필요한 조건을 먼저 고정합니다.
    - label: 기본 중첩 모델 처리 실행
      detail: 스키마 검증 코드를 실행해 중간 결과를 확인합니다.
    - label: 모델 리스트 결과 검증
      detail: 성공 모델과 오류 메시지 기준으로 실행 결과를 비교합니다.
    - label: 중첩모델설계 재사용
      detail: 완성 코드를 API/자동화 입력 계약에 붙일 수 있게 정리합니다.
    runtime:
    - label: 데이터 계약 환경
      detail: pydantic 기준으로 로컬 Python 실행을 준비합니다.
    - label: 중첩모델설계 실행
      detail: 셀을 실행해 성공 모델과 오류 메시지와 예외 상태를 확인합니다.
    - label: 중첩모델설계 완료
      detail: 검증된 코드를 API/자동화 입력 계약로 남깁니다.
sections:
- id: load
  title: 라이브러리 로드
  structuredPrimary: true
  subtitle: Pydantic import 확인
  goal: 라이브러리 로드에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.
  why: import 준비가 정확해야 다음 셀과 자동화 코드에서 같은 이름을 안정적으로 재사용할 수 있습니다.
  explanation: 중첩 모델은 실제 애플리케이션에서 가장 많이 사용되는 패턴입니다. JSON API 응답, 데이터베이스 관계, 복잡한 설정 파일 등 모두 중첩 구조를 가집니다.
    Pydantic은 중첩된 모델도 자동으로 검증하고 변환해주어, 타입 안전성을 유지하면서 복잡한 데이터를 쉽게 다룰 수 있습니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    import pydantic
    from typing import Optional, List, Dict, Union
    from pydantic import BaseModel, Field, ValidationError
  exercise:
    prompt: 라이브러리 로드 예제에서 import한 모듈의 별칭이나 바로 이어지는 확인 호출을 바꿔 준비 상태를 확인하세요.
    starterCode: |-
      import pydantic
      from typing import Optional, List, Dict, Union
      from pydantic import BaseModel, Field, ValidationError
    hints:
    - 바꿀 지점은 외부 입력을 만드는 첫 줄과 스키마 검증 줄에서 찾으세요.
    - 실행 뒤 성공 모델과 오류 메시지 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    type: noError
    noError: 라이브러리 로드의 import 대상 모듈과 별칭이 현재 로컬 환경에서 준비되어야 합니다.
    resultCheck: 라이브러리 로드 실행 결과가 성공 모델과 오류 메시지 기준으로 바꾼 입력값을 반영해야 합니다.
- id: basic
  title: 기본 중첩 모델
  structuredPrimary: true
  subtitle: 모델 안의 모델
  goal: 기본 중첩 모델에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    한 모델의 필드 타입으로 다른 모델을 지정하면 자동으로 중첩 검증됩니다. 딕셔너리를 넘기면 자동으로 해당 모델 인스턴스로 변환되고, 중첩된 모델의 필드도 모두 검증됩니다. 점 표기법으로 깊숙한 필드에도 타입 안전하게 접근할 수 있습니다.

    딕셔너리를 넘기면 자동으로 Address 인스턴스로 변환됩니다. 물론 Address 인스턴스를 직접 넘겨도 됩니다.
  snippet: |-
    class Address(BaseModel):
        street: str
        city: str
        zipCode: str

    addr = Address(street="123 Main St", city="Seoul", zipCode="12345")
    addr
  exercise:
    prompt: 기본 중첩 모델 예제에서 \`addr\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.
    starterCode: |-
      class Address(BaseModel):
          street: str
          city: str
          zipCode: str

      addr = Address(street="123 Main St", city="Seoul", zipCode="12345")
      addr
    hints:
    - 바꿀 지점은 \`addr = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`addr\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: 기본 중첩 모델에서 \`addr\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 기본 중첩 모델 실행 뒤 \`addr\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.
- id: listmodel
  title: 모델 리스트
  structuredPrimary: true
  subtitle: list[Model] 타입
  goal: 모델 리스트에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: list[Model] 타입으로 여러 개의 모델을 포함하는 필드를 정의합니다. 주문에 여러 상품이 포함되는 경우처럼, 실제 비즈니스 로직에서 매우 흔한 패턴입니다.
    리스트의 각 항목도 자동으로 검증되어 타입 안전성이 보장됩니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    class OrderItem(BaseModel):
        productId: str
        name: str
        price: float = Field(gt=0)
        quantity: int = Field(ge=1)

    item = OrderItem(productId="P001", name="Laptop", price=999.99, quantity=1)
    item
  exercise:
    prompt: 모델 리스트 예제에서 \`item\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.
    starterCode: |-
      class OrderItem(BaseModel):
          productId: str
          name: str
          price: float = Field(gt=0)
          quantity: int = Field(ge=1)

      item = OrderItem(productId="P001", name="Laptop", price=999.99, quantity=1)
      item
    hints:
    - 바꿀 지점은 \`item = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`item\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: 모델 리스트에서 \`item\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 모델 리스트 실행 뒤 \`item\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.
- id: optional
  title: 선택적 중첩
  structuredPrimary: true
  subtitle: Optional[Model]
  goal: 선택적 중첩에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: Optional[Model]로 중첩 모델을 선택적으로 만들 수 있습니다. 사용자의 프로필 정보가 있을 수도 없을 수도 있는 경우처럼, 비즈니스 로직에 따라
    유연하게 설계할 수 있습니다. 기본값으로 None을 지정하면 해당 필드 없이도 모델을 생성할 수 있습니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    class Profile(BaseModel):
        bio: str
        website: Optional[str] = None

    class Member(BaseModel):
        memberId: str
        name: str
        profile: Optional[Profile] = None

    minimal = Member(memberId="M001", name="Bob")
    minimal
  exercise:
    prompt: 선택적 중첩 예제에서 모델 필드나 입력 dict 값을 바꾸고 검증/직렬화 결과가 달라지는지 확인하세요.
    starterCode: |-
      class Profile(BaseModel):
          bio: str
          website: Optional[str] = None

      class Member(BaseModel):
          memberId: str
          name: str
          profile: Optional[Profile] = None

      minimal = Member(memberId="M001", name="Bob")
      minimal
    hints:
    - 바꿀 지점은 모델 필드 선언, 입력 dict, 생성 인자입니다.
    - 실행 뒤 model_dump(), 오류 메시지, 반환값이 바꾼 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 선택적 중첩에서 \`minimal\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 선택적 중첩 실행 뒤 \`minimal\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.
- id: dict
  title: 딕셔너리 타입
  structuredPrimary: true
  subtitle: dict[str, T]
  goal: 딕셔너리 타입에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: dict[str, T] 타입으로 동적 키를 가진 구조를 정의합니다. 메타데이터, 설정 값, 태그 등 키가 미리 정해지지 않은 데이터에 유용합니다. 값 타입도
    지정할 수 있어 dict[str, int], dict[str, Model] 등 다양한 형태로 활용됩니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    class Document(BaseModel):
        docId: str
        title: str
        metadata: dict[str, str]

    doc = Document(
        docId="D001",
        title="Report",
        metadata={"author": "Alice", "version": "1.0", "status": "draft"}
    )
    doc
  exercise:
    prompt: 딕셔너리 타입 예제에서 모델 필드나 입력 dict 값을 바꾸고 검증/직렬화 결과가 달라지는지 확인하세요.
    starterCode: |-
      class Document(BaseModel):
          docId: str
          title: str
          metadata: dict[str, str]

      doc = Document(
          docId="D001",
          title="Report",
          metadata={"author": "Alice", "version": "1.0", "status": "draft"}
      )
      doc
    hints:
    - 바꿀 지점은 모델 필드 선언, 입력 dict, 생성 인자입니다.
    - 실행 뒤 model_dump(), 오류 메시지, 반환값이 바꾼 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 딕셔너리 타입에서 \`doc\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 딕셔너리 타입 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: deep
  title: 깊은 중첩
  structuredPrimary: true
  subtitle: 3단계 이상 구조
  goal: 깊은 중첩에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: 실제 애플리케이션에서는 3단계 이상의 깊은 중첩도 흔합니다. 회사 > 부서 > 직원 구조처럼 계층적 데이터를 표현할 때 유용합니다. Pydantic은 아무리
    깊은 중첩도 자동으로 검증하고, 에러 발생 시 정확한 위치를 알려줍니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    class Employee(BaseModel):
        empId: str
        name: str
        role: str

    class Department(BaseModel):
        deptId: str
        deptName: str
        employees: list[Employee]

    class Company(BaseModel):
        companyId: str
        companyName: str
        departments: list[Department]

    companyData = {
        "companyId": "C001",
        "companyName": "TechCorp",
        "departments": [
            {
                "deptId": "D001",
                "deptName": "Engineering",
                "employees": [
                    {"empId": "E001", "name": "Alice", "role": "Developer"},
                    {"empId": "E002", "name": "Bob", "role": "Designer"}
                ]
            }
        ]
    }
    company = Company.model_validate(companyData)
    company
  exercise:
    prompt: 깊은 중첩 예제에서 모델 필드나 입력 dict 값을 바꾸고 검증/직렬화 결과가 달라지는지 확인하세요.
    starterCode: |-
      class Employee(BaseModel):
          empId: str
          name: str
          role: str

      class Department(BaseModel):
          deptId: str
          deptName: str
          employees: list[Employee]

      class Company(BaseModel):
          companyId: str
          companyName: str
          departments: list[Department]

      companyData = {
          "companyId": "C001",
          "companyName": "TechCorp",
          "departments": [
              {
                  "deptId": "D001",
                  "deptName": "Engineering",
                  "employees": [
                      {"empId": "E001", "name": "Alice", "role": "Developer"},
                      {"empId": "E002", "name": "Bob", "role": "Designer"}
                  ]
              }
          ]
      }
      company = Company.model_validate(companyData)
      company
    hints:
    - 바꿀 지점은 모델 필드 선언, 입력 dict, 생성 인자입니다.
    - 실행 뒤 model_dump(), 오류 메시지, 반환값이 바꾼 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 깊은 중첩에서 \`companyData\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 깊은 중첩 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: selfref
  title: 자기 참조 모델
  structuredPrimary: true
  subtitle: 트리 구조
  goal: 자기 참조 모델에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: 트리 구조나 연결 리스트처럼 모델이 자기 자신을 참조하는 경우가 있습니다. Python 3.11 이상에서는 문자열로 타입을 지정하거나, 클래스 정의 후 update_forward_refs()를
    호출합니다. 카테고리 계층, 댓글 스레드 등에 활용됩니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    class TreeNode(BaseModel):
        value: str
        children: list["TreeNode"] = []

    treeData = {
        "value": "root",
        "children": [
            {"value": "child1", "children": []},
            {"value": "child2", "children": [{"value": "grandchild", "children": []}]}
        ]
    }
    tree = TreeNode.model_validate(treeData)
    tree
  exercise:
    prompt: 자기 참조 모델 예제에서 모델 필드나 입력 dict 값을 바꾸고 검증/직렬화 결과가 달라지는지 확인하세요.
    starterCode: |-
      class TreeNode(BaseModel):
          value: str
          children: list["TreeNode"] = []

      treeData = {
          "value": "root",
          "children": [
              {"value": "child1", "children": []},
              {"value": "child2", "children": [{"value": "grandchild", "children": []}]}
          ]
      }
      tree = TreeNode.model_validate(treeData)
      tree
    hints:
    - 바꿀 지점은 모델 필드 선언, 입력 dict, 생성 인자입니다.
    - 실행 뒤 model_dump(), 오류 메시지, 반환값이 바꾼 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 자기 참조 모델에서 \`treeData\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 자기 참조 모델 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: union
  title: Union 타입
  structuredPrimary: true
  subtitle: 여러 타입 허용
  goal: Union[TextMessage, ImageMessage] 같은 다형 필드를 정의하고 Pydantic이 입력을 어떤 순서로 시도해 매칭하는지 확인합니다.
  why: 실제 API는 한 필드가 여러 형태를 가질 수 있습니다. Union으로 그 다형성을 모델 수준에서 표현해 두면 호출자가 isinstance 분기 없이 패턴 매칭으로 처리할 수 있습니다.
  explanation: Union으로 필드가 여러 타입 중 하나를 가질 수 있게 합니다. 메시지가 텍스트일 수도, 이미지일 수도 있는 경우처럼 다형성이 필요할 때 사용합니다. Pydantic은
    순서대로 타입을 시도하여 첫 번째로 성공하는 타입으로 변환합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    class TextContent(BaseModel):
        contentType: str = "text"
        text: str

    class ImageContent(BaseModel):
        contentType: str = "image"
        url: str
        width: int
        height: int

    class Message(BaseModel):
        msgId: str
        content: Union[TextContent, ImageContent]

    textMsg = Message(msgId="M001", content={"contentType": "text", "text": "Hello!"})
    textMsg
  exercise:
    prompt: Union 타입 예제에서 모델 필드나 입력 dict 값을 바꾸고 검증/직렬화 결과가 달라지는지 확인하세요.
    starterCode: |-
      class TextContent(BaseModel):
          contentType: str = "text"
          text: str

      class ImageContent(BaseModel):
          contentType: str = "image"
          url: str
          width: int
          height: int

      class Message(BaseModel):
          msgId: str
          content: Union[TextContent, ImageContent]

      textMsg = Message(msgId="M001", content={"contentType": "text", "text": "Hello!"})
      textMsg
    hints:
    - 바꿀 지점은 모델 필드 선언, 입력 dict, 생성 인자입니다.
    - 실행 뒤 model_dump(), 오류 메시지, 반환값이 바꾼 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: Union 타입의 입력 데이터와 처리 인자가 다음 단계까지 도달해야 합니다.
    resultCheck: Union 타입 결과 값이 본문 기대값과 일치해야 합니다.
- id: serial
  title: 중첩 직렬화
  structuredPrimary: true
  subtitle: model_dump 옵션
  goal: 중첩 직렬화에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: 중첩 모델도 자동으로 직렬화됩니다. model_dump()는 중첩된 모델을 딕셔너리로, model_dump_json()은 JSON 문자열로 변환합니다. exclude
    옵션으로 특정 필드를 제외하고, by_alias로 별칭을 사용할 수도 있습니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    class Order(BaseModel):
        orderId: str
        items: list[OrderItem]

    order = Order(
        orderId="O001",
        items=[OrderItem(productId="P001", name="Laptop", price=999.99, quantity=1)],
    )
    orderDict = order.model_dump()
    orderDict
  exercise:
    prompt: 중첩 직렬화 예제에서 \`orderDict\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.
    starterCode: |-
      class Order(BaseModel):
          orderId: str
          items: list[OrderItem]

      order = Order(
          orderId="O001",
          items=[OrderItem(productId="P001", name="Laptop", price=999.99, quantity=1)],
      )
      orderDict = order.model_dump()
      orderDict
    hints:
    - 바꿀 지점은 \`orderDict = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`orderDict\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: 중첩 직렬화에서 \`orderDict\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 중첩 직렬화 실행 뒤 \`orderDict\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.
- id: result
  title: E-커머스 주문 시스템
  structuredPrimary: true
  subtitle: 종합 모델 설계
  goal: E커머스 주문 시스템에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: 지금까지 배운 중첩 모델, 리스트, Optional, 딕셔너리를 모두 활용하여 실제 E-커머스 서비스에서 사용할 수 있는 주문 시스템을 완성합니다. 고객 정보,
    상품 목록, 배송지, 결제 정보를 모두 포함한 복잡한 구조입니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    from pydantic import computed_field

    class ShippingAddress(BaseModel):
        recipient: str
        phone: str
        address: str
        zipCode: str

    class CartItem(BaseModel):
        productId: str
        productName: str
        unitPrice: float = Field(gt=0)
        quantity: int = Field(ge=1)
        discount: float = Field(ge=0, le=100, default=0)

        @computed_field
        @property
        def subtotal(self) -> float:
            return self.unitPrice * self.quantity * (1 - self.discount / 100)

    class CompleteOrder(BaseModel):
        orderId: str
        customerId: str
        items: list[CartItem] = Field(min_length=1)
        shipping: ShippingAddress
        couponCode: Optional[str] = None
        note: Optional[str] = None

        @computed_field
        @property
        def totalAmount(self) -> float:
            return sum(item.subtotal for item in self.items)

        @computed_field
        @property
        def itemCount(self) -> int:
            return sum(item.quantity for item in self.items)

    fullOrder = CompleteOrder(
        orderId="ORD-2024-001",
        customerId="C100",
        items=[
            {"productId": "P001", "productName": "노트북", "unitPrice": 1200000, "quantity": 1, "discount": 10},
            {"productId": "P002", "productName": "마우스", "unitPrice": 50000, "quantity": 2}
        ],
        shipping={"recipient": "홍길동", "phone": "010-1234-5678", "address": "서울시 강남구", "zipCode": "06234"}
    )
    fullOrder
  exercise:
    prompt: E커머스 주문 시스템 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      from pydantic import computed_field

      class ShippingAddress(BaseModel):
          recipient: str
          phone: str
          address: str
          zipCode: str

      class CartItem(BaseModel):
          productId: str
          productName: str
          unitPrice: float = Field(gt=0)
          quantity: int = Field(ge=1)
          discount: float = Field(ge=0, le=100, default=0)

          @computed_field
          @property
          def subtotal(self) -> float:
              return self.unitPrice * self.quantity * (1 - self.discount / 100)

      class CompleteOrder(BaseModel):
          orderId: str
          customerId: str
          items: list[CartItem] = Field(min_length=1)
          shipping: ShippingAddress
          couponCode: Optional[str] = None
          note: Optional[str] = None

          @computed_field
          @property
          def totalAmount(self) -> float:
              return sum(item.subtotal for item in self.items)

          @computed_field
          @property
          def itemCount(self) -> int:
              return sum(item.quantity for item in self.items)

      fullOrder = CompleteOrder(
          orderId="ORD-2024-001",
          customerId="C100",
          items=[
              {"productId": "P001", "productName": "노트북", "unitPrice": 1200000, "quantity": 1, "discount": 10},
              {"productId": "P002", "productName": "마우스", "unitPrice": 50000, "quantity": 2}
          ],
          shipping={"recipient": "홍길동", "phone": "010-1234-5678", "address": "서울시 강남구", "zipCode": "06234"}
      )
      fullOrder
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: E커머스 주문 시스템의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: E커머스 주문 시스템 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: practice
  title: 실습
  structuredPrimary: true
  subtitle: 중첩 모델 프로젝트
  goal: 실습에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: |-
    지금까지 배운 중첩 모델, 리스트, Optional, Union, computed_field를 활용하여 복잡한 데이터 구조를 설계합니다.

    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.
  snippet: |-
    from pydantic import BaseModel, Field, computed_field
    from typing import Optional

    class Author(BaseModel):
        authorId: str
        name: str
        email: str

    class CommentItem(BaseModel):
        commentId: str
        author: Author
        content: str
        createdAt: str

    class BlogPost(BaseModel):
        postId: str
        title: str
        content: str
        author: Author
        tags: list[str] = []
        comments: list[CommentItem] = []
        publishedAt: Optional[str] = None

        @computed_field
        @property
        def commentCount(self) -> int:
            return len(self.comments)

    postData = {
        "postId": "P001",
        "title": "Pydantic 시작하기",
        "content": "Pydantic은 데이터 검증 라이브러리입니다...",
        "author": {"authorId": "A001", "name": "Alice", "email": "alice@blog.com"},
        "tags": ["python", "pydantic"],
        "comments": [
            {"commentId": "C001", "author": {"authorId": "A002", "name": "Bob", "email": "bob@mail.com"}, "content": "좋은 글!", "createdAt": "2024-01-15"}
        ],
        "publishedAt": "2024-01-14"
    }
    post = BlogPost.model_validate(postData)
    post
  exercise:
    prompt: 실습 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      from pydantic import BaseModel, Field, computed_field
      from typing import Optional

      class Author(BaseModel):
          authorId: str
          name: str
          email: str

      class CommentItem(BaseModel):
          commentId: str
          author: Author
          content: str
          createdAt: str

      class BlogPost(BaseModel):
          postId: str
          title: str
          content: str
          author: Author
          tags: list[str] = []
          comments: list[CommentItem] = []
          publishedAt: Optional[str] = None

          @computed_field
          @property
          def commentCount(self) -> int:
              return len(self.comments)

      postData = {
          "postId": "P001",
          "title": "Pydantic 시작하기",
          "content": "Pydantic은 데이터 검증 라이브러리입니다...",
          "author": {"authorId": "A001", "name": "Alice", "email": "alice@blog.com"},
          "tags": ["python", "pydantic"],
          "comments": [
              {"commentId": "C001", "author": {"authorId": "A002", "name": "Bob", "email": "bob@mail.com"}, "content": "좋은 글!", "createdAt": "2024-01-15"}
          ],
          "publishedAt": "2024-01-14"
      }
      post = BlogPost.model_validate(postData)
      post
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 실습의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 실습 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: workflow_validation
  title: '현업 흐름 검증: 주문 입력 계약과 배치 검증'
  structuredPrimary: true
  subtitle: 예측 → 검증 실패 확인 → 정제 → 결과 검증 → 실무 변주
  goal: '현업 흐름 검증: 주문 입력 계약과 배치 검증에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.'
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.
  explanation: Pydantic은 모델을 만드는 데서 끝나지 않고, 외부 입력을 업무 계약으로 바꾸고 실패 이유를 구조화하는 데서 가치가 큽니다. 여기서는 주문 입력을 검증하고,
    잘못된 행을 분리한 뒤, 정상 데이터만 다음 단계로 넘기는 흐름을 검증합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    from typing import Literal
    from pydantic import BaseModel, Field, ValidationError, computed_field, field_validator

    class OrderInput(BaseModel):
        orderId: str
        customer: str
        amount: int = Field(gt=0)
        status: Literal['paid', 'pending', 'cancelled']

        @field_validator('orderId', 'customer')
        @classmethod
        def stripRequiredText(cls, value):
            cleaned = value.strip()
            if not cleaned:
                raise ValueError('text field must not be empty')
            return cleaned

        @computed_field
        @property
        def isRevenue(self) -> bool:
            return self.status == 'paid'

    validOrder = OrderInput.model_validate({
        'orderId': ' A-100 ',
        'customer': ' kim ',
        'amount': '120000',
        'status': 'paid',
    })

    assert validOrder.orderId == 'A-100'
    assert validOrder.amount == 120000
    assert validOrder.isRevenue is True
    validOrder.model_dump()
  exercise:
    prompt: '현업 흐름 검증: 주문 입력 계약과 배치 검증 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.'
    starterCode: |-
      from typing import Literal
      from pydantic import BaseModel, Field, ValidationError, computed_field, field_validator

      class OrderInput(BaseModel):
          orderId: str
          customer: str
          amount: int = Field(gt=0)
          status: Literal['paid', 'pending', 'cancelled']

          @field_validator('orderId', 'customer')
          @classmethod
          def stripRequiredText(cls, value):
              cleaned = value.strip()
              if not cleaned:
                  raise ValueError('text field must not be empty')
              return cleaned

          @computed_field
          @property
          def isRevenue(self) -> bool:
              return self.status == 'paid'

      validOrder = OrderInput.model_validate({
          'orderId': ' A-100 ',
          'customer': ' kim ',
          'amount': '120000',
          'status': 'paid',
      })

      assert validOrder.orderId == 'A-100'
      assert validOrder.amount == 120000
      assert validOrder.isRevenue is True
      validOrder.model_dump()
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: '현업 흐름 검증: 주문 입력 계약과 배치 검증의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.'
    resultCheck: '현업 흐름 검증: 주문 입력 계약과 배치 검증 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.'
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
  - id: pydantic_03-nested-order-contract-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - load
    - workflow_validation
    title: 중첩 주문·품목 구조와 합계 검증하기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: 각 item의 수량·단가를 검증하고 선언된 total과 계산 total을 비교한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 중첩 item을 모두 검증한 뒤 합계를 계산하세요.
    - 외부가 보낸 total을 신뢰하지 말고 계산값과 비교하세요.
    exercise:
      prompt: validate_nested_order(payload)를 완성해 orderId, itemCount, calculatedTotal을 반환하세요.
      starterCode: |-
        def validate_nested_order(payload):
            raise NotImplementedError
      solution: |
        def validate_nested_order(payload):
            items = payload.get("items")
            if not isinstance(items, list) or not items:
                raise ValueError("items required")
            total = 0
            for item in items:
                quantity = item.get("quantity")
                unit_price = item.get("unitPrice")
                if not isinstance(quantity, int) or isinstance(quantity, bool) or quantity < 1 or unit_price < 0:
                    raise ValueError("invalid item")
                total += quantity * unit_price
            if payload.get("declaredTotal") != total:
                raise ValueError("total mismatch")
            return {"orderId": payload["orderId"], "itemCount": len(items), "calculatedTotal": total}
      hints: *id001
    check:
      id: python.pydantic.pydantic_03.nested-order-contract.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.pydantic.pydantic_03.nested-order-contract.mastery.behavior.v1.fixture
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
        entry: validate_nested_order
        cases:
        - id: checks-nested-total
          arguments:
          - value:
              orderId: O-1
              items:
              - quantity: 2
                unitPrice: 1000
              - quantity: 1
                unitPrice: 500
              declaredTotal: 2500
          expectedReturn:
            orderId: O-1
            itemCount: 2
            calculatedTotal: 2500
        - id: rejects-total-mismatch
          arguments:
          - value:
              orderId: O-2
              items:
              - quantity: 1
                unitPrice: 100
              declaredTotal: 90
          expectedException: ValueError
        - id: rejects-empty-items
          arguments:
          - value:
              orderId: O-3
              items: []
              declaredTotal: 0
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: pydantic_03-nested-team-contract-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - pydantic_03-nested-order-contract-mastery
    title: 새 조직·팀·구성원 중첩 구조 검증하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: 주문 중첩 검증을 팀별 고유 email과 전체 인원 집계로 전이한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - 중복 검사는 한 팀 안이 아니라 조직 전체 범위에서 하세요.
    - 중첩 값의 정규화 뒤 고유성을 검사하세요.
    exercise:
      prompt: validate_organization(payload)를 완성해 teamCount, memberCount, emails를 반환하세요.
      starterCode: |-
        def validate_organization(payload):
            raise NotImplementedError
      solution: |
        def validate_organization(payload):
            teams = payload.get("teams", [])
            emails = []
            for team in teams:
                if not team.get("name") or not team.get("members"):
                    raise ValueError("team needs name and members")
                for member in team["members"]:
                    email = str(member.get("email", "")).strip().lower()
                    if "@" not in email or email in emails:
                        raise ValueError("invalid or duplicate email")
                    emails.append(email)
            return {"teamCount": len(teams), "memberCount": len(emails), "emails": sorted(emails)}
      hints: *id002
    check:
      id: python.pydantic.pydantic_03.nested-team-contract.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.pydantic.pydantic_03.nested-team-contract.transfer.behavior.v1.fixture
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
        entry: validate_organization
        cases:
        - id: validates-deep-members
          arguments:
          - value:
              teams:
              - name: Data
                members:
                - email: ' A@EXAMPLE.COM '
                - email: b@example.com
              - name: Web
                members:
                - email: c@example.com
          expectedReturn:
            teamCount: 2
            memberCount: 3
            emails:
            - a@example.com
            - b@example.com
            - c@example.com
        - id: rejects-duplicate-across-teams
          arguments:
          - value:
              teams:
              - name: A
                members:
                - email: same@example.com
              - name: B
                members:
                - email: same@example.com
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: pydantic_03-nested-error-path-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - pydantic_03-nested-team-contract-transfer
    title: 중첩 오류의 정확한 path 표현 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: list index와 field 이름을 조합해 수정 가능한 오류 위치를 선택한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - 중첩 list에는 0부터 시작하는 index를 path에 포함하세요.
    - 오류가 발생한 가장 가까운 model 책임을 함께 표시하세요.
    exercise:
      prompt: choose_nested_error_path(situation)를 완성해 path, message, owner를 반환하세요.
      starterCode: |-
        def choose_nested_error_path(situation):
            raise NotImplementedError
      solution: |
        def choose_nested_error_path(situation):
            table = {'second-item-quantity': {'path': 'items.1.quantity', 'message': 'must be positive', 'owner': 'item model'}, 'first-team-member-email': {'path': 'teams.0.members.0.email', 'message': 'invalid email', 'owner': 'member model'}, 'order-total-mismatch': {'path': 'declaredTotal', 'message': 'does not match items', 'owner': 'order model'}}
            if situation not in table:
                raise ValueError('unknown situation')
            return table[situation]
      hints: *id003
    check:
      id: python.pydantic.pydantic_03.nested-error-path.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.pydantic.pydantic_03.nested-error-path.retrieval.behavior.v1.fixture
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
        entry: choose_nested_error_path
        cases:
        - id: recalls-second-item-quantity
          arguments:
          - value: second-item-quantity
          expectedReturn:
            path: items.1.quantity
            message: must be positive
            owner: item model
        - id: recalls-first-team-member-email
          arguments:
          - value: first-team-member-email
          expectedReturn:
            path: teams.0.members.0.email
            message: invalid email
            owner: member model
        - id: rejects-unknown-situation
          arguments:
          - value: unknown
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};