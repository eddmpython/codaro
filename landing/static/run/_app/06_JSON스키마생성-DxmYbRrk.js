var e=`meta:\r
  packages:\r
  - pydantic\r
  id: pydantic_06\r
  title: JSON스키마생성\r
  order: 6\r
  category: pydantic\r
  difficulty: ⭐⭐\r
  badge: 기초\r
  tags:\r
  - pydantic\r
  - json-schema\r
  - OpenAPI\r
  - 문서화\r
  - API\r
  seo:\r
    title: Pydantic JSON Schema - API 문서화와 OpenAPI\r
    description: Pydantic 모델에서 JSON Schema를 생성합니다. OpenAPI 문서화, 스키마 커스터마이즈를 배웁니다.\r
    keywords:\r
    - pydantic\r
    - json-schema\r
    - OpenAPI\r
    - 문서화\r
intro:\r
  emoji: 📋\r
  goal: Pydantic 모델에서 REST API 문서화용 JSON Schema를 자동 생성합니다.\r
  description: API를 개발할 때 문서화는 필수입니다. 하지만 코드와 문서를 따로 관리하면 불일치가 생깁니다. Pydantic은 모델 정의에서 자동으로 JSON Schema를\r
    생성하여 코드와 문서가 항상 동기화됩니다. FastAPI는 이 기능을 활용해 Swagger UI를 자동 생성합니다.\r
  direction: JSON스키마생성에서 입력 스키마를 정의하고 검증된 데이터만 처리 흐름에 넘김합니다.\r
  benefits:\r
  - 외부 입력 확인 후 스키마 검증에 맞는 코드 입력을 고릅니다.\r
  - JSON스키마생성 결과를 성공 모델과 오류 메시지 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 API/자동화 입력 계약에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 라이브러리 로드 입력 확인\r
      detail: 입력 기준(외부 입력)과 필요한 조건을 먼저 고정합니다.\r
    - label: 기본 스키마 생성 처리 실행\r
      detail: 스키마 검증 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 필드 설명 추가 결과 검증\r
      detail: 성공 모델과 오류 메시지 기준으로 실행 결과를 비교합니다.\r
    - label: JSON스키마생성 재사용\r
      detail: 완성 코드를 API/자동화 입력 계약에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 데이터 계약 환경\r
      detail: pydantic 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: JSON스키마생성 실행\r
      detail: 셀을 실행해 성공 모델과 오류 메시지와 예외 상태를 확인합니다.\r
    - label: JSON스키마생성 완료\r
      detail: 검증된 코드를 API/자동화 입력 계약로 남깁니다.\r
sections:\r
- id: load\r
  title: 라이브러리 로드\r
  structuredPrimary: true\r
  subtitle: Pydantic import 확인\r
  goal: 라이브러리 로드에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: import 준비가 정확해야 다음 셀과 자동화 코드에서 같은 이름을 안정적으로 재사용할 수 있습니다.\r
  explanation: JSON Schema는 JSON 데이터의 구조를 정의하는 표준입니다. Pydantic의 model_json_schema() 메서드는 모델 정의를 분석하여 자동으로\r
    JSON Schema를 생성합니다. 이 스키마는 API 문서화, 폼 자동 생성, 클라이언트 코드 생성 등에 활용됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import json\r
    import pydantic\r
    from enum import Enum\r
    from typing import Optional, List, Dict\r
    from pydantic import BaseModel, Field, ConfigDict\r
  exercise:\r
    prompt: 라이브러리 로드 예제에서 import한 모듈의 별칭이나 바로 이어지는 확인 호출을 바꿔 준비 상태를 확인하세요.\r
    starterCode: |-\r
      import json\r
      import pydantic\r
      from enum import Enum\r
      from typing import Optional, List, Dict\r
      from pydantic import BaseModel, Field, ConfigDict\r
    hints:\r
    - 바꿀 지점은 외부 입력을 만드는 첫 줄과 스키마 검증 줄에서 찾으세요.\r
    - 실행 뒤 성공 모델과 오류 메시지 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 라이브러리 로드의 import 대상 모듈과 별칭이 현재 로컬 환경에서 준비되어야 합니다.\r
    resultCheck: 라이브러리 로드 실행 결과가 성공 모델과 오류 메시지 기준으로 바꾼 입력값을 반영해야 합니다.\r
- id: basic\r
  title: 기본 스키마 생성\r
  structuredPrimary: true\r
  subtitle: model_json_schema\r
  goal: 기본 스키마 생성에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    model_json_schema() 클래스 메서드를 호출하면 JSON Schema 딕셔너리가 반환됩니다. 기본 타입(str, int, float, bool)은 해당 JSON Schema 타입으로 매핑되고, 필수 필드와 선택 필드가 자동으로 구분됩니다.\r
\r
    스키마의 'properties'에 필드 정보가, 'required'에 필수 필드 목록이 포함됩니다.\r
  snippet: |-\r
    class User(BaseModel):\r
        name: str\r
        age: int\r
        email: str\r
\r
    userSchema = User.model_json_schema()\r
    userSchema\r
  exercise:\r
    prompt: 기본 스키마 생성 예제에서 \`userSchema\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      class User(BaseModel):\r
          name: str\r
          age: int\r
          email: str\r
\r
      userSchema = User.model_json_schema()\r
      userSchema\r
    hints:\r
    - 바꿀 지점은 \`userSchema = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`userSchema\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 기본 스키마 생성에서 \`userSchema\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 기본 스키마 생성 실행 뒤 \`userSchema\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: description\r
  title: 필드 설명 추가\r
  structuredPrimary: true\r
  subtitle: Field description\r
  goal: 필드 설명 추가에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: Field의 description 파라미터로 필드에 설명을 추가하면 JSON Schema에 포함됩니다. API 문서를 보는 개발자가 각 필드의 의미와 용도를\r
    이해할 수 있습니다. 제약조건(gt, le, min_length 등)도 스키마에 반영됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    class Product(BaseModel):\r
        productId: str = Field(description="고유 상품 식별자")\r
        name: str = Field(description="상품명", min_length=1, max_length=100)\r
        price: float = Field(description="상품 가격 (원)", gt=0)\r
        stock: int = Field(default=0, description="재고 수량", ge=0)\r
\r
    productSchema = Product.model_json_schema()\r
    json.dumps(productSchema, indent=2, ensure_ascii=False)\r
  exercise:\r
    prompt: 필드 설명 추가 예제에서 \`productSchema\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      class Product(BaseModel):\r
          productId: str = Field(description="고유 상품 식별자")\r
          name: str = Field(description="상품명", min_length=1, max_length=100)\r
          price: float = Field(description="상품 가격 (원)", gt=0)\r
          stock: int = Field(default=0, description="재고 수량", ge=0)\r
\r
      productSchema = Product.model_json_schema()\r
      json.dumps(productSchema, indent=2, ensure_ascii=False)\r
    hints:\r
    - 바꿀 지점은 \`productSchema = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`productSchema\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 필드 설명 추가에서 \`productSchema\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 필드 설명 추가 실행 뒤 \`productSchema\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: examples\r
  title: 예시 값 추가\r
  structuredPrimary: true\r
  subtitle: examples 파라미터\r
  goal: 예시 값 추가에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: Field의 examples 파라미터로 예시 값을 추가하면 API 문서에서 사용자가 필드 형식을 이해하기 쉬워집니다. json_schema_extra로 모델\r
    전체에 예시 데이터를 추가할 수도 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    class Contact(BaseModel):\r
        name: str = Field(description="이름", examples=["홍길동", "김철수"])\r
        phone: str = Field(description="전화번호", examples=["010-1234-5678"])\r
        email: str = Field(description="이메일", examples=["user@example.com"])\r
\r
    contactSchema = Contact.model_json_schema()\r
    contactSchema["properties"]["name"]\r
  exercise:\r
    prompt: 예시 값 추가 예제에서 Field 예시나 입력값을 바꾸고 생성된 JSON Schema 속성이 달라지는지 확인하세요.\r
    starterCode: |-\r
      class Contact(BaseModel):\r
          name: str = Field(description="이름", examples=["홍길동", "김철수"])\r
          phone: str = Field(description="전화번호", examples=["010-1234-5678"])\r
          email: str = Field(description="이메일", examples=["user@example.com"])\r
\r
      contactSchema = Contact.model_json_schema()\r
      contactSchema["properties"]["name"]\r
    hints:\r
    - 바꿀 지점은 Field 예시, 모델 필드 선언, schema 조회 키입니다.\r
    - 실행 뒤 JSON Schema의 properties와 examples가 바꾼 정의를 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 예시 값 추가에서 \`contactSchema\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 예시 값 추가 실행 뒤 \`contactSchema\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.\r
- id: nested\r
  title: 중첩 모델 스키마\r
  structuredPrimary: true\r
  subtitle: $defs와 $ref\r
  goal: 중첩 모델 스키마에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 중첩된 모델은 JSON Schema의 $defs 섹션에 정의되고 $ref로 참조됩니다. 이 방식으로 복잡한 모델도 깔끔하게 표현되고, 같은 모델을 여러 곳에서\r
    재사용할 때 중복을 피할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    class Author(BaseModel):\r
        authorId: str = Field(description="작성자 ID")\r
        name: str = Field(description="작성자 이름")\r
\r
    class Article(BaseModel):\r
        title: str = Field(description="기사 제목")\r
        content: str = Field(description="기사 내용")\r
        author: Author\r
\r
    articleSchema = Article.model_json_schema()\r
    json.dumps(articleSchema, indent=2, ensure_ascii=False)\r
  exercise:\r
    prompt: 중첩 모델 스키마 예제에서 \`articleSchema\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      class Author(BaseModel):\r
          authorId: str = Field(description="작성자 ID")\r
          name: str = Field(description="작성자 이름")\r
\r
      class Article(BaseModel):\r
          title: str = Field(description="기사 제목")\r
          content: str = Field(description="기사 내용")\r
          author: Author\r
\r
      articleSchema = Article.model_json_schema()\r
      json.dumps(articleSchema, indent=2, ensure_ascii=False)\r
    hints:\r
    - 바꿀 지점은 \`articleSchema = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`articleSchema\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    noError: 중첩 모델 스키마에서 \`articleSchema\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 중첩 모델 스키마 실행 뒤 \`articleSchema\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: optional\r
  title: Optional과 Union 스키마\r
  structuredPrimary: true\r
  subtitle: anyOf 표현\r
  goal: Optional과 Union 스키마에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: Optional 타입은 해당 타입 또는 null을 허용하는 anyOf로 표현됩니다. Union 타입도 마찬가지로 여러 타입 중 하나를 허용하는 구조로 변환됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    class Profile(BaseModel):\r
        username: str\r
        bio: Optional[str] = None\r
        website: Optional[str] = None\r
\r
    profileSchema = Profile.model_json_schema()\r
    profileSchema["properties"]["bio"]\r
  exercise:\r
    prompt: Optional과 Union 스키마 예제에서 선택 필드 타입이나 입력값을 바꾸고 schema의 anyOf/null 허용이 어떻게 표현되는지 확인하세요.\r
    starterCode: |-\r
      class Profile(BaseModel):\r
          username: str\r
          bio: Optional[str] = None\r
          website: Optional[str] = None\r
\r
      profileSchema = Profile.model_json_schema()\r
      profileSchema["properties"]["bio"]\r
    hints:\r
    - 바꿀 지점은 Optional/Union 타입 선언과 입력 예시입니다.\r
    - 실행 뒤 JSON Schema의 anyOf, nullable 표현, properties가 바꾼 타입을 반영하는지 보세요.\r
  check:\r
    noError: Optional과 Union 스키마에서 \`profileSchema\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: Optional과 Union 스키마 실행 뒤 \`profileSchema\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.\r
- id: enum\r
  title: Enum과 Literal 스키마\r
  structuredPrimary: true\r
  subtitle: 허용값 목록\r
  goal: Enum과 Literal 스키마에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: Enum과 Literal 타입은 허용되는 값 목록으로 스키마가 생성됩니다. API 문서에서 클라이언트 개발자가 어떤 값을 사용할 수 있는지 명확하게 알 수\r
    있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    class Status(str, Enum):\r
        PENDING = "pending"\r
        ACTIVE = "active"\r
        COMPLETED = "completed"\r
\r
    class Task(BaseModel):\r
        taskId: str\r
        status: Status = Field(description="작업 상태")\r
\r
    taskSchema = Task.model_json_schema()\r
    taskSchema["$defs"]["Status"]\r
  exercise:\r
    prompt: Enum과 Literal 스키마 예제에서 허용값을 바꾸고 schema의 enum/const 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      class Status(str, Enum):\r
          PENDING = "pending"\r
          ACTIVE = "active"\r
          COMPLETED = "completed"\r
\r
      class Task(BaseModel):\r
          taskId: str\r
          status: Status = Field(description="작업 상태")\r
\r
      taskSchema = Task.model_json_schema()\r
      taskSchema["$defs"]["Status"]\r
    hints:\r
    - 바꿀 지점은 Enum 멤버, Literal 허용값, schema 조회 키입니다.\r
    - 실행 뒤 JSON Schema의 enum/const 값이 바꾼 정의를 반영하는지 보세요.\r
  check:\r
    noError: Enum과 Literal 스키마에서 \`PENDING\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: Enum과 Literal 스키마 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: list\r
  title: 리스트와 딕셔너리\r
  structuredPrimary: true\r
  subtitle: array와 object\r
  goal: 리스트와 딕셔너리에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: list 타입은 JSON Schema의 array로, dict 타입은 object로 변환됩니다. 리스트와 딕셔너리의 요소 타입도 정확하게 스키마에 반영됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    class TaggedItem(BaseModel):\r
        itemId: str\r
        tags: list[str] = Field(description="태그 목록")\r
        scores: list[int] = Field(default=[], description="점수 목록")\r
\r
    taggedSchema = TaggedItem.model_json_schema()\r
    taggedSchema["properties"]["tags"]\r
  exercise:\r
    prompt: 리스트와 딕셔너리 예제에서 컬렉션 필드 타입이나 기본값을 바꾸고 schema의 배열/객체 표현을 확인하세요.\r
    starterCode: |-\r
      class TaggedItem(BaseModel):\r
          itemId: str\r
          tags: list[str] = Field(description="태그 목록")\r
          scores: list[int] = Field(default=[], description="점수 목록")\r
\r
      taggedSchema = TaggedItem.model_json_schema()\r
      taggedSchema["properties"]["tags"]\r
    hints:\r
    - 바꿀 지점은 list/dict 필드 선언, 기본값, schema 조회 키입니다.\r
    - 실행 뒤 JSON Schema의 array/object 타입과 item 정의가 바꾼 모델을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 리스트와 딕셔너리에서 \`taggedSchema\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 리스트와 딕셔너리 실행 뒤 \`taggedSchema\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.\r
- id: mode\r
  title: 스키마 생성 모드\r
  structuredPrimary: true\r
  subtitle: validation vs serialization\r
  goal: 스키마 생성 모드에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: |-\r
    model_json_schema()의 mode 파라미터로 용도에 맞는 스키마를 생성합니다. 'validation'은 입력 검증용(computed_field 미포함), 'serialization'은 출력용(computed_field 포함) 스키마입니다.\r
\r
    validation 모드는 클라이언트가 보낼 데이터 형식을, serialization 모드는 서버가 응답할 데이터 형식을 정의합니다.\r
  snippet: |-\r
    class Item(BaseModel):\r
        name: str\r
        price: float\r
\r
        @computed_field\r
        @property\r
        def formattedPrice(self) -> str:\r
            return f"₩{self.price:,.0f}"\r
\r
    validationSchema = Item.model_json_schema(mode='validation')\r
    "formattedPrice" in validationSchema.get("properties", {})\r
  exercise:\r
    prompt: 스키마 생성 모드 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      class Item(BaseModel):\r
          name: str\r
          price: float\r
\r
          @computed_field\r
          @property\r
          def formattedPrice(self) -> str:\r
              return f"₩{self.price:,.0f}"\r
\r
      validationSchema = Item.model_json_schema(mode='validation')\r
      "formattedPrice" in validationSchema.get("properties", {})\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    noError: 스키마 생성 모드의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 스키마 생성 모드 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: custom\r
  title: 커스텀 스키마 수정\r
  structuredPrimary: true\r
  subtitle: json_schema_extra\r
  goal: json_schema_extra로 OpenAPI 확장 필드(x-version, tags 등)를 모델 스키마에 삽입하고, model_json_schema 출력에 그 키가 포함되는지 확인합니다.\r
  why: 표준 JSON Schema에 없는 메타데이터(버전, 태그, 내부 식별자)를 API 문서에 노출하려면 확장 키가 필요합니다. json_schema_extra가 그 통로입니다.\r
  explanation: json_schema_extra로 생성된 스키마에 추가 정보를 삽입할 수 있습니다. OpenAPI 확장 필드(x-), 버전 정보, 태그 등 표준 스키마에 없는\r
    메타데이터를 추가할 때 유용합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    class CustomModel(BaseModel):\r
        model_config = {\r
            "json_schema_extra": {\r
                "x-api-version": "v1",\r
                "x-deprecated": False,\r
                "x-tags": ["users", "auth"]\r
            }\r
        }\r
        userId: str\r
        role: str\r
\r
    customSchema = CustomModel.model_json_schema()\r
    customSchema.get("x-api-version"), customSchema.get("x-tags")\r
  exercise:\r
    prompt: 커스텀 스키마 수정 예제에서 json_schema_extra 값을 바꾸고 schema에 추가 메타데이터가 반영되는지 확인하세요.\r
    starterCode: |-\r
      class CustomModel(BaseModel):\r
          model_config = {\r
              "json_schema_extra": {\r
                  "x-api-version": "v1",\r
                  "x-deprecated": False,\r
                  "x-tags": ["users", "auth"]\r
              }\r
          }\r
          userId: str\r
          role: str\r
\r
      customSchema = CustomModel.model_json_schema()\r
      customSchema.get("x-api-version"), customSchema.get("x-tags")\r
    hints:\r
    - 바꿀 지점은 \`json_schema_extra\`, 모델 필드, schema 조회 키입니다.\r
    - 실행 뒤 JSON Schema의 확장 메타데이터가 바꾼 정의를 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 커스텀 스키마 수정의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 커스텀 스키마 수정의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: result\r
  title: REST API 스키마 시스템\r
  structuredPrimary: true\r
  subtitle: 요청/응답 스키마 완성\r
  goal: 요청/응답 두 모델과 에러 모델까지 묶어 REST API 한 엔드포인트의 전체 스키마를 종합 생성하고, FastAPI/Swagger가 바로 받을 수 있는 형식인지 확인합니다.\r
  why: 운영 API는 한 엔드포인트가 보통 요청/응답/에러 세 모델을 동시에 가집니다. 한 강의 안에서 세 모델을 묶어 만들어 봐야 운영 코드 구조가 손에 익습니다.\r
  explanation: 지금까지 배운 모든 기법을 종합하여 실제 REST API의 요청/응답 스키마를 생성합니다. FastAPI와 같은 프레임워크에서 이 스키마를 활용하여 자동으로\r
    Swagger 문서를 생성합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    class CreateUserRequest(BaseModel):\r
        model_config = {\r
            "json_schema_extra": {\r
                "examples": [{\r
                    "username": "alice",\r
                    "email": "alice@example.com",\r
                    "password": "secure123"\r
                }]\r
            }\r
        }\r
        username: str = Field(min_length=3, max_length=50, description="사용자명")\r
        email: str = Field(description="이메일 주소")\r
        password: str = Field(min_length=8, description="비밀번호")\r
\r
    requestSchema = CreateUserRequest.model_json_schema()\r
    json.dumps(requestSchema, indent=2, ensure_ascii=False)\r
  exercise:\r
    prompt: REST API 스키마 시스템 예제에서 요청 필드나 응답 필드를 바꾸고 생성된 API schema 구조가 달라지는지 확인하세요.\r
    starterCode: |-\r
      class CreateUserRequest(BaseModel):\r
          model_config = {\r
              "json_schema_extra": {\r
                  "examples": [{\r
                      "username": "alice",\r
                      "email": "alice@example.com",\r
                      "password": "secure123"\r
                  }]\r
              }\r
          }\r
          username: str = Field(min_length=3, max_length=50, description="사용자명")\r
          email: str = Field(description="이메일 주소")\r
          password: str = Field(min_length=8, description="비밀번호")\r
\r
      requestSchema = CreateUserRequest.model_json_schema()\r
      json.dumps(requestSchema, indent=2, ensure_ascii=False)\r
    hints:\r
    - 바꿀 지점은 요청/응답 모델 필드와 schema 조회 키입니다.\r
    - 실행 뒤 JSON Schema의 properties와 required 목록이 바꾼 모델을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: REST API 스키마 시스템의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: REST API 스키마 시스템의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: API 스키마 프로젝트\r
  goal: model_json_schema, Field, examples, Enum, 중첩 모델을 결합해 사용자 등록/조회 API의 완전한 스키마 한 세트를 직접 만들어 봅니다.\r
  why: 강의 본문이 가르친 기법은 한 API 스키마 세트에 결합해야 운영 시나리오에서의 결합 방식이 손에 익습니다.\r
  explanation: |-\r
    지금까지 배운 model_json_schema, Field, examples, Enum, 중첩 모델을 활용하여 완전한 API 스키마를 생성합니다.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  snippet: |-\r
    from pydantic import BaseModel, Field\r
    from typing import Optional\r
    from enum import Enum\r
    import json\r
\r
    class PostStatus(str, Enum):\r
        DRAFT = "draft"\r
        PUBLISHED = "published"\r
        ARCHIVED = "archived"\r
\r
    class AuthorInfo(BaseModel):\r
        authorId: str = Field(description="작성자 고유 ID")\r
        name: str = Field(description="작성자 이름")\r
\r
    class BlogPostRequest(BaseModel):\r
        model_config = {\r
            "json_schema_extra": {\r
                "examples": [{\r
                    "title": "Pydantic 시작하기",\r
                    "content": "Pydantic은 데이터 검증 라이브러리입니다...",\r
                    "tags": ["python", "pydantic"]\r
                }]\r
            }\r
        }\r
        title: str = Field(min_length=1, max_length=200, description="포스트 제목")\r
        content: str = Field(min_length=10, description="포스트 본문")\r
        tags: list[str] = Field(default=[], description="태그 목록")\r
        status: PostStatus = Field(default=PostStatus.DRAFT, description="게시 상태")\r
\r
    class BlogPostResponse(BaseModel):\r
        postId: str = Field(description="포스트 고유 ID")\r
        title: str = Field(description="포스트 제목")\r
        content: str = Field(description="포스트 본문")\r
        author: AuthorInfo\r
        tags: list[str] = Field(description="태그 목록")\r
        status: PostStatus = Field(description="게시 상태")\r
        createdAt: str = Field(description="생성 시각")\r
        updatedAt: Optional[str] = Field(default=None, description="수정 시각")\r
\r
    blogReqSchema = BlogPostRequest.model_json_schema()\r
    blogReqSchema\r
  exercise:\r
    prompt: 실습 예제에서 블로그 요청 모델의 필드, 예시, 제약을 바꾸고 schema 출력이 달라지는지 확인하세요.\r
    starterCode: |-\r
      from pydantic import BaseModel, Field\r
      from typing import Optional\r
      from enum import Enum\r
      import json\r
\r
      class PostStatus(str, Enum):\r
          DRAFT = "draft"\r
          PUBLISHED = "published"\r
          ARCHIVED = "archived"\r
\r
      class AuthorInfo(BaseModel):\r
          authorId: str = Field(description="작성자 고유 ID")\r
          name: str = Field(description="작성자 이름")\r
\r
      class BlogPostRequest(BaseModel):\r
          model_config = {\r
              "json_schema_extra": {\r
                  "examples": [{\r
                      "title": "Pydantic 시작하기",\r
                      "content": "Pydantic은 데이터 검증 라이브러리입니다...",\r
                      "tags": ["python", "pydantic"]\r
                  }]\r
              }\r
          }\r
          title: str = Field(min_length=1, max_length=200, description="포스트 제목")\r
          content: str = Field(min_length=10, description="포스트 본문")\r
          tags: list[str] = Field(default=[], description="태그 목록")\r
          status: PostStatus = Field(default=PostStatus.DRAFT, description="게시 상태")\r
\r
      class BlogPostResponse(BaseModel):\r
          postId: str = Field(description="포스트 고유 ID")\r
          title: str = Field(description="포스트 제목")\r
          content: str = Field(description="포스트 본문")\r
          author: AuthorInfo\r
          tags: list[str] = Field(description="태그 목록")\r
          status: PostStatus = Field(description="게시 상태")\r
          createdAt: str = Field(description="생성 시각")\r
          updatedAt: Optional[str] = Field(default=None, description="수정 시각")\r
\r
      blogReqSchema = BlogPostRequest.model_json_schema()\r
      blogReqSchema\r
    hints:\r
    - 바꿀 지점은 블로그 요청 모델의 필드, 제약, 예시 값입니다.\r
    - 실행 뒤 JSON Schema의 properties, required, examples가 바꾼 모델 정의를 반영하는지 보세요.\r
  check:\r
    noError: 실습의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 실습의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
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