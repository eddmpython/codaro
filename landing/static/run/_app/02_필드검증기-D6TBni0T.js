var e=`meta:\r
  packages:\r
  - pydantic\r
  id: pydantic_02\r
  title: 필드검증기\r
  order: 2\r
  category: pydantic\r
  difficulty: ⭐\r
  badge: 입문\r
  tags:\r
  - pydantic\r
  - Field\r
  - validator\r
  - 제약조건\r
  - 커스텀검증\r
  seo:\r
    title: Pydantic Field 검증 - 필드 제약조건과 커스텀 검증\r
    description: Pydantic Field로 필드에 제약조건을 설정합니다. 최소/최대값, 문자열 길이, 정규식 패턴, 커스텀 검증기를 배웁니다.\r
    keywords:\r
    - pydantic\r
    - Field\r
    - validator\r
    - 제약조건\r
    - 검증\r
intro:\r
  emoji: ✅\r
  goal: Field와 validator로 회원가입 폼 검증 시스템을 구축합니다.\r
  description: 이 프로젝트에서는 실제 웹 서비스의 회원가입 폼처럼 다양한 검증 규칙을 적용합니다. 숫자 범위 제한, 문자열 길이 검사, 정규식 패턴 매칭, 그리고 비즈니스\r
    로직에 맞는 커스텀 검증까지. 이런 검증 시스템이 있으면 잘못된 데이터가 데이터베이스에 들어가는 것을 원천 차단할 수 있습니다.\r
  direction: 필드검증기에서 입력 스키마를 정의하고 검증된 데이터만 처리 흐름에 넘김합니다.\r
  benefits:\r
  - 외부 입력 확인 후 스키마 검증에 맞는 코드 입력을 고릅니다.\r
  - 필드검증기 결과를 성공 모델과 오류 메시지 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 API/자동화 입력 계약에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 라이브러리 로드 입력 확인\r
      detail: 입력 기준(외부 입력)과 필요한 조건을 먼저 고정합니다.\r
    - label: 숫자 제약조건 처리 실행\r
      detail: 스키마 검증 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 문자열 제약조건 결과 검증\r
      detail: 성공 모델과 오류 메시지 기준으로 실행 결과를 비교합니다.\r
    - label: 필드검증기 재사용\r
      detail: 완성 코드를 API/자동화 입력 계약에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 데이터 계약 환경\r
      detail: pydantic 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 필드검증기 실행\r
      detail: 셀을 실행해 성공 모델과 오류 메시지와 예외 상태를 확인합니다.\r
    - label: 필드검증기 완료\r
      detail: 검증된 코드를 API/자동화 입력 계약로 남깁니다.\r
sections:\r
- id: load\r
  title: 라이브러리 로드\r
  structuredPrimary: true\r
  subtitle: Field와 validator import\r
  goal: 라이브러리 로드에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: import 준비가 정확해야 다음 셀과 자동화 코드에서 같은 이름을 안정적으로 재사용할 수 있습니다.\r
  explanation: Field 함수는 필드에 메타데이터와 제약조건을 추가합니다. field_validator 데코레이터는 커스텀 검증 로직을 구현하고, model_validator는\r
    여러 필드를 동시에 검증합니다. 이들을 조합하면 복잡한 비즈니스 규칙도 우아하게 표현할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import pydantic\r
    from pydantic import BaseModel, Field, ValidationError, field_validator, model_validator, computed_field\r
  exercise:\r
    prompt: 라이브러리 로드 예제에서 import한 모듈의 별칭이나 바로 이어지는 확인 호출을 바꿔 준비 상태를 확인하세요.\r
    starterCode: |-\r
      import pydantic\r
      from pydantic import BaseModel, Field, ValidationError, field_validator, model_validator, computed_field\r
    hints:\r
    - 바꿀 지점은 외부 입력을 만드는 첫 줄과 스키마 검증 줄에서 찾으세요.\r
    - 실행 뒤 성공 모델과 오류 메시지 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 라이브러리 로드의 import 대상 모듈과 별칭이 현재 로컬 환경에서 준비되어야 합니다.\r
    resultCheck: 라이브러리 로드 실행 결과가 성공 모델과 오류 메시지 기준으로 바꾼 입력값을 반영해야 합니다.\r
- id: numeric\r
  title: 숫자 제약조건\r
  structuredPrimary: true\r
  subtitle: gt, ge, lt, le\r
  goal: 숫자 제약조건에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    숫자 필드에는 gt(초과), ge(이상), lt(미만), le(이하)로 범위를 제한할 수 있습니다. 예를 들어 나이는 0 이상 150 이하, 점수는 0 이상 100 이하로 제한하는 것이 일반적입니다. 이런 제약조건은 Field 함수의 파라미터로 간단히 지정합니다.\r
\r
    gt=0은 0 초과(양수만), ge=0은 0 이상을 의미합니다. lt, le도 마찬가지로 미만과 이하를 구분합니다.\r
  snippet: |-\r
    class Student(BaseModel):\r
        name: str\r
        age: int = Field(ge=1, le=150)\r
        score: float = Field(ge=0, le=100)\r
\r
    student = Student(name="Alice", age=20, score=85.5)\r
    student\r
  exercise:\r
    prompt: 숫자 제약조건 예제에서 \`student\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      class Student(BaseModel):\r
          name: str\r
          age: int = Field(ge=1, le=150)\r
          score: float = Field(ge=0, le=100)\r
\r
      student = Student(name="Alice", age=20, score=85.5)\r
      student\r
    hints:\r
    - 바꿀 지점은 \`student = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`student\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 숫자 제약조건에서 \`student\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 숫자 제약조건 실행 뒤 \`student\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: string\r
  title: 문자열 제약조건\r
  structuredPrimary: true\r
  subtitle: min_length, max_length, pattern\r
  goal: 문자열 제약조건에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    문자열 필드에는 min_length와 max_length로 길이를 제한하고, pattern으로 정규식 패턴을 지정할 수 있습니다. 사용자명 3~20자, 비밀번호 8자 이상, 전화번호 형식 검사 등 웹 서비스에서 흔히 필요한 검증을 간단히 구현할 수 있습니다.\r
\r
    정규식 패턴은 re 모듈의 문법을 따릅니다. ^는 시작, $는 끝, \\d는 숫자를 의미합니다.\r
  snippet: |-\r
    class Account(BaseModel):\r
        username: str = Field(min_length=3, max_length=20)\r
        password: str = Field(min_length=8)\r
\r
    account = Account(username="alice", password="secure123")\r
    account\r
  exercise:\r
    prompt: 문자열 제약조건 예제에서 \`account\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      class Account(BaseModel):\r
          username: str = Field(min_length=3, max_length=20)\r
          password: str = Field(min_length=8)\r
\r
      account = Account(username="alice", password="secure123")\r
      account\r
    hints:\r
    - 바꿀 지점은 \`account = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`account\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 문자열 제약조건에서 \`account\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 문자열 제약조건 실행 뒤 \`account\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: description\r
  title: 필드 설명과 기본값\r
  structuredPrimary: true\r
  subtitle: description, default\r
  goal: Field(description=..., default=...)로 필드에 설명과 기본값을 동시에 부여하고, model_json_schema 출력에 정말 description이 포함되는지 확인합니다.\r
  why: API 문서 자동 생성을 위해서는 모델이 곧 스키마여야 합니다. Field의 description은 OpenAPI 문서에 그대로 노출되므로, 코드와 문서가 한 곳에서 같이 자랍니다.\r
  explanation: Field의 description 파라미터로 필드에 설명을 추가할 수 있습니다. 이 설명은 JSON Schema에 포함되어 API 문서화에 활용됩니다. default로\r
    기본값을 지정하면서 동시에 제약조건도 적용할 수 있어, 유연하면서도 안전한 모델을 설계할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    class ServerConfig(BaseModel):\r
        host: str = Field(default="localhost", description="서버 호스트 주소")\r
        port: int = Field(default=8080, ge=1, le=65535, description="포트 번호")\r
        debug: bool = Field(default=False, description="디버그 모드")\r
\r
    config = ServerConfig()\r
    config\r
  exercise:\r
    prompt: 필드 설명과 기본값 예제에서 Field 설명, 기본값, 입력값을 바꾸고 schema와 모델 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      class ServerConfig(BaseModel):\r
          host: str = Field(default="localhost", description="서버 호스트 주소")\r
          port: int = Field(default=8080, ge=1, le=65535, description="포트 번호")\r
          debug: bool = Field(default=False, description="디버그 모드")\r
\r
      config = ServerConfig()\r
      config\r
    hints:\r
    - 바꿀 지점은 Field 설명, 기본값, 모델 생성 입력입니다.\r
    - 실행 뒤 schema 설명과 모델 기본값이 바꾼 정의를 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 필드 설명과 기본값의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 필드 설명과 기본값의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: alias\r
  title: 필드 별칭\r
  structuredPrimary: true\r
  subtitle: alias와 validation_alias\r
  goal: 필드 별칭에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 외부 API나 데이터베이스에서 snake_case를 사용하고 Python 코드에서는 camelCase를 사용하고 싶을 때 alias가 유용합니다. alias로\r
    외부 이름을 지정하면 입력 시 alias로, Python 코드에서는 원래 필드명으로 접근할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    class ApiResponse(BaseModel):\r
        userId: int = Field(alias="user_id")\r
        userName: str = Field(alias="user_name")\r
        createdAt: str = Field(alias="created_at")\r
\r
    responseData = {"user_id": 1, "user_name": "Alice", "created_at": "2024-01-01"}\r
    apiResp = ApiResponse.model_validate(responseData)\r
    apiResp\r
  exercise:\r
    prompt: 필드 별칭 예제에서 \`responseData\`, \`apiResp\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      class ApiResponse(BaseModel):\r
          userId: int = Field(alias="user_id")\r
          userName: str = Field(alias="user_name")\r
          createdAt: str = Field(alias="created_at")\r
\r
      responseData = {"user_id": 1, "user_name": "Alice", "created_at": "2024-01-01"}\r
      apiResp = ApiResponse.model_validate(responseData)\r
      apiResp\r
    hints:\r
    - 바꿀 지점은 \`responseData = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`responseData\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 필드 별칭에서 \`responseData\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 필드 별칭 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: fieldvalidator\r
  title: 커스텀 필드 검증기\r
  structuredPrimary: true\r
  subtitle: field_validator 데코레이터\r
  goal: 커스텀 필드 검증기에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: |-\r
    field_validator 데코레이터로 커스텀 검증 로직을 구현합니다. 값을 정규화(소문자 변환, 공백 제거 등)하거나, 비즈니스 규칙에 맞지 않으면 ValueError를 발생시켜 검증을 실패시킬 수 있습니다. 하나의 검증기를 여러 필드에 적용하는 것도 가능합니다.\r
\r
    field_validator는 반드시 @classmethod와 함께 사용해야 합니다. 첫 번째 인자는 cls, 두 번째가 검증할 값 v입니다.\r
  snippet: |-\r
    class Person(BaseModel):\r
        name: str\r
        email: str\r
\r
        @field_validator('name')\r
        @classmethod\r
        def normalizeName(cls, v):\r
            return v.strip().title()\r
\r
        @field_validator('email')\r
        @classmethod\r
        def lowercaseEmail(cls, v):\r
            return v.lower()\r
\r
    person = Person(name="  alice smith  ", email="ALICE@EXAMPLE.COM")\r
    person.name, person.email\r
  exercise:\r
    prompt: 커스텀 필드 검증기 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      class Person(BaseModel):\r
          name: str\r
          email: str\r
\r
          @field_validator('name')\r
          @classmethod\r
          def normalizeName(cls, v):\r
              return v.strip().title()\r
\r
          @field_validator('email')\r
          @classmethod\r
          def lowercaseEmail(cls, v):\r
              return v.lower()\r
\r
      person = Person(name="  alice smith  ", email="ALICE@EXAMPLE.COM")\r
      person.name, person.email\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 커스텀 필드 검증기의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 커스텀 필드 검증기 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: modelvalidator\r
  title: 모델 검증기\r
  structuredPrimary: true\r
  subtitle: model_validator 데코레이터\r
  goal: 모델 검증기에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: model_validator는 여러 필드를 동시에 검증합니다. 비밀번호와 비밀번호 확인이 일치하는지, 시작일이 종료일보다 앞서는지 등 필드 간 관계를 검사할\r
    때 사용합니다. mode='after'는 개별 필드 검증이 완료된 후 실행됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    class Registration(BaseModel):\r
        email: str\r
        password: str = Field(min_length=8)\r
        confirmPassword: str\r
\r
        @model_validator(mode='after')\r
        def checkPasswords(self):\r
            if self.password != self.confirmPassword:\r
                raise ValueError("비밀번호가 일치하지 않습니다")\r
            return self\r
\r
    reg = Registration(email="test@test.com", password="secure123", confirmPassword="secure123")\r
    reg\r
  exercise:\r
    prompt: 모델 검증기 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      class Registration(BaseModel):\r
          email: str\r
          password: str = Field(min_length=8)\r
          confirmPassword: str\r
\r
          @model_validator(mode='after')\r
          def checkPasswords(self):\r
              if self.password != self.confirmPassword:\r
                  raise ValueError("비밀번호가 일치하지 않습니다")\r
              return self\r
\r
      reg = Registration(email="test@test.com", password="secure123", confirmPassword="secure123")\r
      reg\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 모델 검증기의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 모델 검증기 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: computed\r
  title: 계산된 필드\r
  structuredPrimary: true\r
  subtitle: computed_field 데코레이터\r
  goal: 계산된 필드에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: computed_field는 다른 필드 값을 기반으로 계산되는 읽기 전용 필드입니다. 예를 들어 firstName과 lastName에서 fullName을 자동\r
    생성하거나, 가격과 수량에서 총액을 계산할 수 있습니다. 이 필드는 직렬화 시 자동으로 포함됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    from pydantic import computed_field\r
\r
    class FullName(BaseModel):\r
        firstName: str\r
        lastName: str\r
\r
        @computed_field\r
        @property\r
        def fullName(self) -> str:\r
            return f"{self.firstName} {self.lastName}"\r
\r
    nameObj = FullName(firstName="John", lastName="Doe")\r
    nameObj.fullName\r
  exercise:\r
    prompt: 계산된 필드 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      from pydantic import computed_field\r
\r
      class FullName(BaseModel):\r
          firstName: str\r
          lastName: str\r
\r
          @computed_field\r
          @property\r
          def fullName(self) -> str:\r
              return f"{self.firstName} {self.lastName}"\r
\r
      nameObj = FullName(firstName="John", lastName="Doe")\r
      nameObj.fullName\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 계산된 필드의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 계산된 필드 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: result\r
  title: 종합 회원가입 시스템\r
  structuredPrimary: true\r
  subtitle: 모든 검증 기법 통합\r
  goal: 종합 회원가입 시스템에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: 지금까지 배운 모든 검증 기법을 종합하여 실제 서비스에서 사용할 수 있는 회원가입 폼 검증 시스템을 완성합니다. 숫자 범위, 문자열 패턴, 커스텀 검증, 필드\r
    간 관계 검사, 계산 필드까지 모두 활용합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    class SignupForm(BaseModel):\r
        username: str = Field(min_length=4, max_length=20, description="영문 숫자만")\r
        email: str = Field(pattern=r'^[\\w.-]+@[\\w.-]+\\.\\w+$')\r
        password: str = Field(min_length=8)\r
        confirmPw: str\r
        age: int = Field(ge=14, description="14세 이상만 가입 가능")\r
\r
        @field_validator('username')\r
        @classmethod\r
        def alphanumeric(cls, v):\r
            if not v.isalnum():\r
                raise ValueError("영문과 숫자만 허용")\r
            return v.lower()\r
\r
        @model_validator(mode='after')\r
        def passwordMatch(self):\r
            if self.password != self.confirmPw:\r
                raise ValueError("비밀번호 불일치")\r
            return self\r
\r
    signup = SignupForm(\r
        username="Alice123",\r
        email="alice@mail.com",\r
        password="secure123",\r
        confirmPw="secure123",\r
        age=25\r
    )\r
    signup\r
  exercise:\r
    prompt: 종합 회원가입 시스템 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      class SignupForm(BaseModel):\r
          username: str = Field(min_length=4, max_length=20, description="영문 숫자만")\r
          email: str = Field(pattern=r'^[\\w.-]+@[\\w.-]+\\.\\w+$')\r
          password: str = Field(min_length=8)\r
          confirmPw: str\r
          age: int = Field(ge=14, description="14세 이상만 가입 가능")\r
\r
          @field_validator('username')\r
          @classmethod\r
          def alphanumeric(cls, v):\r
              if not v.isalnum():\r
                  raise ValueError("영문과 숫자만 허용")\r
              return v.lower()\r
\r
          @model_validator(mode='after')\r
          def passwordMatch(self):\r
              if self.password != self.confirmPw:\r
                  raise ValueError("비밀번호 불일치")\r
              return self\r
\r
      signup = SignupForm(\r
          username="Alice123",\r
          email="alice@mail.com",\r
          password="secure123",\r
          confirmPw="secure123",\r
          age=25\r
      )\r
      signup\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 종합 회원가입 시스템의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.\r
    resultCheck: 종합 회원가입 시스템 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 검증 시스템 프로젝트\r
  goal: 실습에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: |-\r
    지금까지 배운 Field 제약조건, field_validator, model_validator, computed_field를 활용하여 다양한 도메인의 검증 시스템을 구축합니다.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  snippet: |-\r
    from pydantic import BaseModel, Field, field_validator, computed_field, ValidationError\r
    from typing import Optional\r
\r
    class ProductForm(BaseModel):\r
        productName: str = Field(min_length=2, max_length=100)\r
        basePrice: float = Field(gt=0)\r
        discountRate: float = Field(ge=0, le=100, default=0)\r
        stock: int = Field(ge=0, default=0)\r
        category: str\r
\r
        @field_validator('category')\r
        @classmethod\r
        def validCategory(cls, v):\r
            allowed = ['electronics', 'clothing', 'food', 'books']\r
            if v.lower() not in allowed:\r
                raise ValueError(f"허용 카테고리: {allowed}")\r
            return v.lower()\r
\r
        @computed_field\r
        @property\r
        def finalPrice(self) -> float:\r
            return self.basePrice * (1 - self.discountRate / 100)\r
\r
        @computed_field\r
        @property\r
        def inStock(self) -> bool:\r
            return self.stock > 0\r
\r
    product = ProductForm(\r
        productName="노트북",\r
        basePrice=1000000,\r
        discountRate=10,\r
        stock=50,\r
        category="Electronics"\r
    )\r
    product\r
  exercise:\r
    prompt: 실습 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      from pydantic import BaseModel, Field, field_validator, computed_field, ValidationError\r
      from typing import Optional\r
\r
      class ProductForm(BaseModel):\r
          productName: str = Field(min_length=2, max_length=100)\r
          basePrice: float = Field(gt=0)\r
          discountRate: float = Field(ge=0, le=100, default=0)\r
          stock: int = Field(ge=0, default=0)\r
          category: str\r
\r
          @field_validator('category')\r
          @classmethod\r
          def validCategory(cls, v):\r
              allowed = ['electronics', 'clothing', 'food', 'books']\r
              if v.lower() not in allowed:\r
                  raise ValueError(f"허용 카테고리: {allowed}")\r
              return v.lower()\r
\r
          @computed_field\r
          @property\r
          def finalPrice(self) -> float:\r
              return self.basePrice * (1 - self.discountRate / 100)\r
\r
          @computed_field\r
          @property\r
          def inStock(self) -> bool:\r
              return self.stock > 0\r
\r
      product = ProductForm(\r
          productName="노트북",\r
          basePrice=1000000,\r
          discountRate=10,\r
          stock=50,\r
          category="Electronics"\r
      )\r
      product\r
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