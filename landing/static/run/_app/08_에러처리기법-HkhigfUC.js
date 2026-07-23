var e=`meta:\r
  packages:\r
  - pydantic\r
  id: pydantic_08\r
  title: 에러처리기법\r
  order: 8\r
  category: pydantic\r
  difficulty: ⭐⭐⭐\r
  badge: 중급\r
  tags:\r
  - pydantic\r
  - ValidationError\r
  - 에러처리\r
  - 커스텀에러\r
  - 로깅\r
  seo:\r
    title: Pydantic 에러 처리 - ValidationError 다루기\r
    description: Pydantic의 ValidationError를 효과적으로 처리합니다. 에러 분석, 커스텀 메시지, 로깅을 배웁니다.\r
    keywords:\r
    - pydantic\r
    - ValidationError\r
    - 에러처리\r
    - 검증\r
intro:\r
  emoji: 🚨\r
  goal: ValidationError를 활용한 REST API 에러 응답 시스템을 구축합니다.\r
  description: API 서버에서 잘못된 데이터가 들어오면 클라이언트에게 정확하고 친절한 에러 메시지를 반환해야 합니다. Pydantic의 ValidationError는 어떤\r
    필드에서 어떤 문제가 발생했는지 상세한 정보를 제공합니다. 이 프로젝트에서는 이 정보를 분석하고, 사용자 친화적인 응답을 생성하며, 로깅과 모니터링에 활용합니다.\r
  direction: 에러처리기법에서 입력 스키마를 정의하고 검증된 데이터만 처리 흐름에 넘김합니다.\r
  benefits:\r
  - 외부 입력 확인 후 스키마 검증에 맞는 코드 입력을 고릅니다.\r
  - 에러처리기법 결과를 성공 모델과 오류 메시지 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 API/자동화 입력 계약에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 라이브러리 로드 입력 확인\r
      detail: 입력 기준(외부 입력)과 필요한 조건을 먼저 고정합니다.\r
    - label: 기본 에러 구조 처리 실행\r
      detail: 스키마 검증 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 에러 상세 분석 결과 검증\r
      detail: 성공 모델과 오류 메시지 기준으로 실행 결과를 비교합니다.\r
    - label: 에러처리기법 재사용\r
      detail: 완성 코드를 API/자동화 입력 계약에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 데이터 계약 환경\r
      detail: pydantic 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 에러처리기법 실행\r
      detail: 셀을 실행해 성공 모델과 오류 메시지와 예외 상태를 확인합니다.\r
    - label: 에러처리기법 완료\r
      detail: 검증된 코드를 API/자동화 입력 계약로 남깁니다.\r
sections:\r
- id: load\r
  title: 라이브러리 로드\r
  structuredPrimary: true\r
  subtitle: Pydantic import 확인\r
  goal: 라이브러리 로드에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: import 준비가 정확해야 다음 셀과 자동화 코드에서 같은 이름을 안정적으로 재사용할 수 있습니다.\r
  explanation: ValidationError는 검증 실패 시 발생하는 예외입니다. errors() 메서드로 각 에러의 상세 정보를, error_count()로 에러 개수를,\r
    json()으로 JSON 형식의 에러 정보를 얻을 수 있습니다. 이 정보들을 조합하여 API 응답이나 로그를 구성합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import pydantic\r
    from pydantic import BaseModel, Field, ValidationError, field_validator\r
  exercise:\r
    prompt: 라이브러리 로드 예제에서 import한 모듈의 별칭이나 바로 이어지는 확인 호출을 바꿔 준비 상태를 확인하세요.\r
    starterCode: |-\r
      import pydantic\r
      from pydantic import BaseModel, Field, ValidationError, field_validator\r
    hints:\r
    - 바꿀 지점은 외부 입력을 만드는 첫 줄과 스키마 검증 줄에서 찾으세요.\r
    - 실행 뒤 성공 모델과 오류 메시지 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 라이브러리 로드의 import 대상 모듈과 별칭이 현재 로컬 환경에서 준비되어야 합니다.\r
    resultCheck: 라이브러리 로드 실행 결과가 성공 모델과 오류 메시지 기준으로 바꾼 입력값을 반영해야 합니다.\r
- id: basic\r
  title: 기본 에러 구조\r
  structuredPrimary: true\r
  subtitle: ValidationError 분석\r
  goal: 기본 에러 구조에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    ValidationError가 발생하면 errors() 메서드로 각 에러의 상세 정보를 리스트로 얻습니다. 각 항목은 loc(위치), msg(메시지), type(에러 타입), input(입력값)을 포함합니다. error_count()는 발생한 에러의 총 개수를 반환합니다.\r
\r
    에러 개수는 error_count()로, 에러 목록은 errors()로, 모델 이름은 title 속성으로 확인합니다.\r
  snippet: |-\r
    class User(BaseModel):\r
        name: str = Field(min_length=2)\r
        age: int = Field(ge=0, le=150)\r
        email: str\r
\r
    try:\r
        invalidUser = User(name="A", age=-5, email="invalid")\r
    except ValidationError as e:\r
        validationErr = e\r
        validationErr\r
  exercise:\r
    prompt: 기본 에러 구조 예제에서 \`invalidUser\`, \`validationErr\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      class User(BaseModel):\r
          name: str = Field(min_length=2)\r
          age: int = Field(ge=0, le=150)\r
          email: str\r
\r
      try:\r
          invalidUser = User(name="A", age=-5, email="invalid")\r
      except ValidationError as e:\r
          validationErr = e\r
          validationErr\r
    hints:\r
    - 바꿀 지점은 \`invalidUser = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`invalidUser\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 기본 에러 구조에서 \`invalidUser\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 기본 에러 구조 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: structure\r
  title: 에러 상세 분석\r
  structuredPrimary: true\r
  subtitle: errors() 메서드\r
  goal: 에러 상세 분석에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: errors() 리스트의 각 항목을 분석하면 에러 위치, 메시지, 타입, 입력값을 알 수 있습니다. loc은 튜플로 필드 위치를 나타내고, 중첩 모델이나 리스트에서는\r
    경로 전체가 포함됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    errorList = validationErr.errors()\r
    errorList\r
  exercise:\r
    prompt: 에러 상세 분석 예제에서 \`errorList\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      errorList = validationErr.errors()\r
      errorList\r
    hints:\r
    - 바꿀 지점은 \`errorList = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`errorList\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 에러 상세 분석에서 \`errorList\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 에러 상세 분석 실행 뒤 \`errorList\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: nested\r
  title: 중첩 모델 에러\r
  structuredPrimary: true\r
  subtitle: 깊은 위치 추적\r
  goal: 중첩 모델 에러에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: 중첩 모델에서 에러가 발생하면 loc이 경로 전체를 포함합니다. 예를 들어 ('address', 'zipCode')는 address 필드 내의 zipCode에서\r
    에러가 발생했음을 의미합니다. 리스트의 경우 ('items', 1, 'price')처럼 인덱스도 포함됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    class Address(BaseModel):\r
        city: str = Field(min_length=2)\r
        zipCode: str = Field(pattern=r'^\\d{5}$')\r
\r
    class Person(BaseModel):\r
        name: str\r
        address: Address\r
\r
    try:\r
        badPerson = Person(name="Alice", address={"city": "S", "zipCode": "abc"})\r
    except ValidationError as e:\r
        nestedErr = e.errors()\r
        nestedErr\r
  exercise:\r
    prompt: 중첩 모델 에러 예제에서 패턴이나 샘플 문자열을 바꾸고 추출/치환 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      class Address(BaseModel):\r
          city: str = Field(min_length=2)\r
          zipCode: str = Field(pattern=r'^\\d{5}$')\r
\r
      class Person(BaseModel):\r
          name: str\r
          address: Address\r
\r
      try:\r
          badPerson = Person(name="Alice", address={"city": "S", "zipCode": "abc"})\r
      except ValidationError as e:\r
          nestedErr = e.errors()\r
          nestedErr\r
    hints:\r
    - 바꿀 지점은 정규식 패턴, 그룹, re.search/findall/sub의 입력 문자열입니다.\r
    - 실행 뒤 매치 그룹, 추출 목록, 치환 문자열이 바꾼 패턴과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 중첩 모델 에러의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.\r
    resultCheck: 중첩 모델 에러의 실행 결과가 본문 기대값과 일치해야 합니다.\r
- id: json\r
  title: JSON 에러 응답\r
  structuredPrimary: true\r
  subtitle: API 응답 생성\r
  goal: JSON 에러 응답에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    json() 메서드는 에러 정보를 JSON 문자열로 반환합니다. 하지만 직접 API 응답 형식을 정의하면 더 유연하게 에러를 표현할 수 있습니다. 필드명을 점 표기법으로 변환하거나, 에러 메시지를 한글화하는 등의 가공이 가능합니다.\r
\r
    loc은 튜플이므로 '.'.join()으로 'address.zipCode' 같은 점 표기법 경로로 변환합니다.\r
  snippet: |-\r
    errorJson = validationErr.json()\r
    errorJson\r
  exercise:\r
    prompt: JSON 에러 응답 예제에서 \`errorJson\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      errorJson = validationErr.json()\r
      errorJson\r
    hints:\r
    - 바꿀 지점은 \`errorJson = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`errorJson\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: JSON 에러 응답에서 \`errorJson\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: JSON 에러 응답 실행 뒤 \`errorJson\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: custom\r
  title: 커스텀 에러 메시지\r
  structuredPrimary: true\r
  subtitle: field_validator 활용\r
  goal: 커스텀 에러 메시지에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: field_validator에서 ValueError를 발생시키면 커스텀 에러 메시지를 정의할 수 있습니다. 비즈니스 규칙에 맞는 친절한 한글 메시지를 제공하면\r
    클라이언트가 문제를 쉽게 이해하고 수정할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    class Registration(BaseModel):\r
        username: str\r
        password: str\r
        age: int\r
\r
        @field_validator('username')\r
        @classmethod\r
        def validateUsername(cls, v):\r
            if len(v) < 4:\r
                raise ValueError("사용자명은 4자 이상이어야 합니다")\r
            if not v.isalnum():\r
                raise ValueError("사용자명은 영문과 숫자만 허용됩니다")\r
            return v\r
\r
        @field_validator('password')\r
        @classmethod\r
        def validatePassword(cls, v):\r
            if len(v) < 8:\r
                raise ValueError("비밀번호는 8자 이상이어야 합니다")\r
            if not any(c.isdigit() for c in v):\r
                raise ValueError("비밀번호에 숫자가 포함되어야 합니다")\r
            return v\r
\r
    try:\r
        badReg = Registration(username="ab@", password="short", age=25)\r
    except ValidationError as e:\r
        customErr = e.errors()\r
        customErr\r
  exercise:\r
    prompt: 커스텀 에러 메시지 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      class Registration(BaseModel):\r
          username: str\r
          password: str\r
          age: int\r
\r
          @field_validator('username')\r
          @classmethod\r
          def validateUsername(cls, v):\r
              if len(v) < 4:\r
                  raise ValueError("사용자명은 4자 이상이어야 합니다")\r
              if not v.isalnum():\r
                  raise ValueError("사용자명은 영문과 숫자만 허용됩니다")\r
              return v\r
\r
          @field_validator('password')\r
          @classmethod\r
          def validatePassword(cls, v):\r
              if len(v) < 8:\r
                  raise ValueError("비밀번호는 8자 이상이어야 합니다")\r
              if not any(c.isdigit() for c in v):\r
                  raise ValueError("비밀번호에 숫자가 포함되어야 합니다")\r
              return v\r
\r
      try:\r
          badReg = Registration(username="ab@", password="short", age=25)\r
      except ValidationError as e:\r
          customErr = e.errors()\r
          customErr\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 커스텀 에러 메시지의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 커스텀 에러 메시지 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: safe\r
  title: 안전한 검증\r
  structuredPrimary: true\r
  subtitle: 예외 없는 검증\r
  goal: 안전한 검증에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: try-except를 매번 쓰는 대신 결과 객체를 반환하는 래퍼 함수를 만들면 코드가 깔끔해집니다. 성공 시 데이터를, 실패 시 에러 목록을 포함하는 결과\r
    객체로 일관된 처리가 가능합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    from typing import TypeVar, Generic\r
\r
    T = TypeVar('T', bound=BaseModel)\r
\r
    class ValidationResult(Generic[T]):\r
        def __init__(self, success: bool, data: T | None = None, errors: list = None):\r
            self.success = success\r
            self.data = data\r
            self.errors = errors or []\r
\r
    def safeValidate(modelClass, data: dict) -> ValidationResult:\r
        try:\r
            instance = modelClass.model_validate(data)\r
            return ValidationResult(success=True, data=instance)\r
        except ValidationError as e:\r
            return ValidationResult(success=False, errors=e.errors())\r
\r
    result1 = safeValidate(User, {"name": "Alice", "age": 25, "email": "a@b.com"})\r
    result2 = safeValidate(User, {"name": "A", "age": -5, "email": "bad"})\r
    result1.success, result2.success\r
  exercise:\r
    prompt: 안전한 검증 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      from typing import TypeVar, Generic\r
\r
      T = TypeVar('T', bound=BaseModel)\r
\r
      class ValidationResult(Generic[T]):\r
          def __init__(self, success: bool, data: T | None = None, errors: list = None):\r
              self.success = success\r
              self.data = data\r
              self.errors = errors or []\r
\r
      def safeValidate(modelClass, data: dict) -> ValidationResult:\r
          try:\r
              instance = modelClass.model_validate(data)\r
              return ValidationResult(success=True, data=instance)\r
          except ValidationError as e:\r
              return ValidationResult(success=False, errors=e.errors())\r
\r
      result1 = safeValidate(User, {"name": "Alice", "age": 25, "email": "a@b.com"})\r
      result2 = safeValidate(User, {"name": "A", "age": -5, "email": "bad"})\r
      result1.success, result2.success\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 안전한 검증의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 안전한 검증 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: batch\r
  title: 배치 검증\r
  structuredPrimary: true\r
  subtitle: 여러 데이터 검증\r
  goal: 배치 검증에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: CSV나 API 배치 요청처럼 여러 레코드를 한번에 검증해야 할 때가 있습니다. 각 레코드의 성공/실패를 추적하고, 실패한 레코드에 대한 상세 정보를 수집하면\r
    배치 작업의 품질 보고서를 생성할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    class Product(BaseModel):\r
        productId: str\r
        name: str = Field(min_length=2)\r
        price: float = Field(gt=0)\r
\r
    dataList = [\r
        {"productId": "P1", "name": "Laptop", "price": 1000},\r
        {"productId": "P2", "name": "A", "price": 50},\r
        {"productId": "P3", "name": "Mouse", "price": -10},\r
        {"productId": "P4", "name": "Keyboard", "price": 100}\r
    ]\r
\r
    def batchValidate(modelClass, dataItems):\r
        results = {"valid": [], "invalid": []}\r
        for idx, item in enumerate(dataItems):\r
            try:\r
                validated = modelClass.model_validate(item)\r
                results["valid"].append({"index": idx, "data": validated.model_dump()})\r
            except ValidationError as e:\r
                results["invalid"].append({"index": idx, "input": item, "errors": e.errors()})\r
        return results\r
\r
    batchResults = batchValidate(Product, dataList)\r
    batchResults\r
  exercise:\r
    prompt: 배치 검증 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      class Product(BaseModel):\r
          productId: str\r
          name: str = Field(min_length=2)\r
          price: float = Field(gt=0)\r
\r
      dataList = [\r
          {"productId": "P1", "name": "Laptop", "price": 1000},\r
          {"productId": "P2", "name": "A", "price": 50},\r
          {"productId": "P3", "name": "Mouse", "price": -10},\r
          {"productId": "P4", "name": "Keyboard", "price": 100}\r
      ]\r
\r
      def batchValidate(modelClass, dataItems):\r
          results = {"valid": [], "invalid": []}\r
          for idx, item in enumerate(dataItems):\r
              try:\r
                  validated = modelClass.model_validate(item)\r
                  results["valid"].append({"index": idx, "data": validated.model_dump()})\r
              except ValidationError as e:\r
                  results["invalid"].append({"index": idx, "input": item, "errors": e.errors()})\r
          return results\r
\r
      batchResults = batchValidate(Product, dataList)\r
      batchResults\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 배치 검증의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 배치 검증 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: logging\r
  title: 에러 로깅\r
  structuredPrimary: true\r
  subtitle: 모니터링 통합\r
  goal: 에러 로깅에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: 프로덕션 환경에서는 검증 에러를 로깅하여 데이터 품질 문제를 추적해야 합니다. 어떤 필드에서 어떤 에러가 자주 발생하는지 분석하면 API 문서 개선이나 클라이언트\r
    버그 발견에 도움이 됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    from datetime import datetime\r
\r
    class ValidationLogger:\r
        def __init__(self):\r
            self.logs = []\r
\r
        def logError(self, modelName: str, error: ValidationError, inputData: dict):\r
            logEntry = {\r
                "timestamp": datetime.now().isoformat(),\r
                "model": modelName,\r
                "errorCount": error.error_count(),\r
                "errors": [\r
                    {"field": ".".join(str(l) for l in e["loc"]), "type": e["type"]}\r
                    for e in error.errors()\r
                ],\r
                "inputSample": str(inputData)[:100]\r
            }\r
            self.logs.append(logEntry)\r
            return logEntry\r
\r
        def getStats(self):\r
            if not self.logs:\r
                return {"totalErrors": 0}\r
            errorTypes = {}\r
            for log in self.logs:\r
                for err in log["errors"]:\r
                    errorTypes[err["type"]] = errorTypes.get(err["type"], 0) + 1\r
            return {\r
                "totalLogs": len(self.logs),\r
                "errorTypeDistribution": errorTypes\r
            }\r
\r
    logger = ValidationLogger()\r
\r
    testData = {"name": "A", "age": -5, "email": "bad"}\r
    try:\r
        User.model_validate(testData)\r
    except ValidationError as e:\r
        logEntry = logger.logError("User", e, testData)\r
        logEntry\r
  exercise:\r
    prompt: 에러 로깅 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      from datetime import datetime\r
\r
      class ValidationLogger:\r
          def __init__(self):\r
              self.logs = []\r
\r
          def logError(self, modelName: str, error: ValidationError, inputData: dict):\r
              logEntry = {\r
                  "timestamp": datetime.now().isoformat(),\r
                  "model": modelName,\r
                  "errorCount": error.error_count(),\r
                  "errors": [\r
                      {"field": ".".join(str(l) for l in e["loc"]), "type": e["type"]}\r
                      for e in error.errors()\r
                  ],\r
                  "inputSample": str(inputData)[:100]\r
              }\r
              self.logs.append(logEntry)\r
              return logEntry\r
\r
          def getStats(self):\r
              if not self.logs:\r
                  return {"totalErrors": 0}\r
              errorTypes = {}\r
              for log in self.logs:\r
                  for err in log["errors"]:\r
                      errorTypes[err["type"]] = errorTypes.get(err["type"], 0) + 1\r
              return {\r
                  "totalLogs": len(self.logs),\r
                  "errorTypeDistribution": errorTypes\r
              }\r
\r
      logger = ValidationLogger()\r
\r
      testData = {"name": "A", "age": -5, "email": "bad"}\r
      try:\r
          User.model_validate(testData)\r
      except ValidationError as e:\r
          logEntry = logger.logError("User", e, testData)\r
          logEntry\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 에러 로깅의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 에러 로깅 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: result\r
  title: API 에러 응답 시스템\r
  structuredPrimary: true\r
  subtitle: 종합 에러 처리\r
  goal: API 에러 응답 시스템에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: 지금까지 배운 모든 기법을 종합하여 실제 REST API에서 사용할 수 있는 에러 응답 시스템을 완성합니다. 일관된 형식, 상세한 정보, 친절한 메시지를 제공하는\r
    완전한 에러 처리 체계입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    class ErrorDetail(BaseModel):\r
        field: str\r
        message: str\r
        code: str\r
\r
    class ApiErrorResponse(BaseModel):\r
        success: bool = False\r
        errorCode: str\r
        message: str\r
        details: list[ErrorDetail] = []\r
\r
    def createApiError(error: ValidationError, code: str = "VALIDATION_ERROR") -> ApiErrorResponse:\r
        details = []\r
        for err in error.errors():\r
            details.append(ErrorDetail(\r
                field=".".join(str(loc) for loc in err["loc"]),\r
                message=err["msg"],\r
                code=err["type"]\r
            ))\r
        return ApiErrorResponse(\r
            errorCode=code,\r
            message=f"{error.error_count()}개의 검증 오류가 발생했습니다",\r
            details=details\r
        )\r
\r
    try:\r
        badUser = User(name="A", age=-5, email="bad")\r
    except ValidationError as e:\r
        apiErrorResp = createApiError(e)\r
        apiErrorResp.model_dump_json(indent=2)\r
  exercise:\r
    prompt: API 에러 응답 시스템 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      class ErrorDetail(BaseModel):\r
          field: str\r
          message: str\r
          code: str\r
\r
      class ApiErrorResponse(BaseModel):\r
          success: bool = False\r
          errorCode: str\r
          message: str\r
          details: list[ErrorDetail] = []\r
\r
      def createApiError(error: ValidationError, code: str = "VALIDATION_ERROR") -> ApiErrorResponse:\r
          details = []\r
          for err in error.errors():\r
              details.append(ErrorDetail(\r
                  field=".".join(str(loc) for loc in err["loc"]),\r
                  message=err["msg"],\r
                  code=err["type"]\r
              ))\r
          return ApiErrorResponse(\r
              errorCode=code,\r
              message=f"{error.error_count()}개의 검증 오류가 발생했습니다",\r
              details=details\r
          )\r
\r
      try:\r
          badUser = User(name="A", age=-5, email="bad")\r
      except ValidationError as e:\r
          apiErrorResp = createApiError(e)\r
          apiErrorResp.model_dump_json(indent=2)\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    noError: API 에러 응답 시스템의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: API 에러 응답 시스템 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 에러 처리 프로젝트\r
  goal: 실습에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: |-\r
    지금까지 배운 ValidationError 분석, 커스텀 메시지, 안전한 검증, 배치 처리, 로깅을 활용하여 완전한 에러 처리 시스템을 구축합니다.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  snippet: |-\r
    from pydantic import BaseModel, Field, field_validator, ValidationError\r
    from typing import Optional\r
\r
    class FormValidator:\r
        errorMessages = {\r
            "string_too_short": "최소 {min_length}자 이상 입력해주세요",\r
            "string_too_long": "최대 {max_length}자까지 입력 가능합니다",\r
            "greater_than": "0보다 큰 값을 입력해주세요",\r
            "string_pattern_mismatch": "올바른 형식이 아닙니다"\r
        }\r
\r
        @classmethod\r
        def localizeError(cls, error: dict) -> str:\r
            errType = error.get("type", "")\r
            ctx = error.get("ctx", {})\r
            template = cls.errorMessages.get(errType, error.get("msg", "검증 오류"))\r
            try:\r
                return template.format(**ctx)\r
            except KeyError:\r
                return template\r
\r
    class ContactForm(BaseModel):\r
        name: str = Field(min_length=2, max_length=50)\r
        email: str = Field(pattern=r'^[\\w.-]+@[\\w.-]+\\.\\w+$')\r
        phone: str = Field(pattern=r'^\\d{3}-\\d{4}-\\d{4}$')\r
        message: str = Field(min_length=10, max_length=1000)\r
\r
    formData = {"name": "A", "email": "bad", "phone": "123", "message": "short"}\r
\r
    try:\r
        ContactForm.model_validate(formData)\r
    except ValidationError as e:\r
        localizedErrors = []\r
        for err in e.errors():\r
            localizedErrors.append({\r
                "field": err["loc"][0],\r
                "message": FormValidator.localizeError(err)\r
            })\r
        localizedErrors\r
  exercise:\r
    prompt: 실습 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      from pydantic import BaseModel, Field, field_validator, ValidationError\r
      from typing import Optional\r
\r
      class FormValidator:\r
          errorMessages = {\r
              "string_too_short": "최소 {min_length}자 이상 입력해주세요",\r
              "string_too_long": "최대 {max_length}자까지 입력 가능합니다",\r
              "greater_than": "0보다 큰 값을 입력해주세요",\r
              "string_pattern_mismatch": "올바른 형식이 아닙니다"\r
          }\r
\r
          @classmethod\r
          def localizeError(cls, error: dict) -> str:\r
              errType = error.get("type", "")\r
              ctx = error.get("ctx", {})\r
              template = cls.errorMessages.get(errType, error.get("msg", "검증 오류"))\r
              try:\r
                  return template.format(**ctx)\r
              except KeyError:\r
                  return template\r
\r
      class ContactForm(BaseModel):\r
          name: str = Field(min_length=2, max_length=50)\r
          email: str = Field(pattern=r'^[\\w.-]+@[\\w.-]+\\.\\w+$')\r
          phone: str = Field(pattern=r'^\\d{3}-\\d{4}-\\d{4}$')\r
          message: str = Field(min_length=10, max_length=1000)\r
\r
      formData = {"name": "A", "email": "bad", "phone": "123", "message": "short"}\r
\r
      try:\r
          ContactForm.model_validate(formData)\r
      except ValidationError as e:\r
          localizedErrors = []\r
          for err in e.errors():\r
              localizedErrors.append({\r
                  "field": err["loc"][0],\r
                  "message": FormValidator.localizeError(err)\r
              })\r
          localizedErrors\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 실습의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.\r
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