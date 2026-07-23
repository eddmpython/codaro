var e=`meta:\r
  packages:\r
  - pydantic\r
  id: pydantic_07\r
  title: 커스텀타입정의\r
  order: 7\r
  category: pydantic\r
  difficulty: ⭐⭐⭐\r
  badge: 중급\r
  tags:\r
  - pydantic\r
  - custom-type\r
  - Annotated\r
  - AfterValidator\r
  - 타입\r
  seo:\r
    title: Pydantic 커스텀 타입 - 재사용 가능한 검증 타입\r
    description: Pydantic으로 커스텀 타입을 정의합니다. Annotated, AfterValidator, 제약 타입을 배웁니다.\r
    keywords:\r
    - pydantic\r
    - custom-type\r
    - Annotated\r
    - validator\r
intro:\r
  emoji: 🎨\r
  goal: 도메인 특화 커스텀 타입으로 한국형 비즈니스 데이터 검증 라이브러리를 구축합니다.\r
  description: 같은 검증 로직을 여러 모델에서 반복하면 유지보수가 어려워집니다. Annotated와 검증기를 조합하여 재사용 가능한 커스텀 타입을 정의하면, 전화번호, 사업자번호,\r
    우편번호 등 도메인 특화 타입을 만들어 프로젝트 전체에서 일관되게 사용할 수 있습니다.\r
  direction: 커스텀타입정의에서 입력 스키마를 정의하고 검증된 데이터만 처리 흐름에 넘김합니다.\r
  benefits:\r
  - 외부 입력 확인 후 스키마 검증에 맞는 코드 입력을 고릅니다.\r
  - 커스텀타입정의 결과를 성공 모델과 오류 메시지 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 API/자동화 입력 계약에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 라이브러리 로드 입력 확인\r
      detail: 입력 기준(외부 입력)과 필요한 조건을 먼저 고정합니다.\r
    - label: Annotated 기초 처리 실행\r
      detail: 스키마 검증 코드를 실행해 중간 결과를 확인합니다.\r
    - label: AfterValidator 결과 검증\r
      detail: 성공 모델과 오류 메시지 기준으로 실행 결과를 비교합니다.\r
    - label: 커스텀타입정의 재사용\r
      detail: 완성 코드를 API/자동화 입력 계약에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 데이터 계약 환경\r
      detail: pydantic 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 커스텀타입정의 실행\r
      detail: 셀을 실행해 성공 모델과 오류 메시지와 예외 상태를 확인합니다.\r
    - label: 커스텀타입정의 완료\r
      detail: 검증된 코드를 API/자동화 입력 계약로 남깁니다.\r
sections:\r
- id: load\r
  title: 라이브러리 로드\r
  structuredPrimary: true\r
  subtitle: Pydantic import 확인\r
  goal: 라이브러리 로드에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: import 준비가 정확해야 다음 셀과 자동화 코드에서 같은 이름을 안정적으로 재사용할 수 있습니다.\r
  explanation: Annotated는 Python 타입 힌트에 메타데이터를 추가하는 표준 방법입니다. Pydantic은 Annotated에 Field나 검증기를 넣어 타입 자체에\r
    검증 규칙을 포함시킵니다. 이렇게 만든 타입 별칭은 어떤 모델에서든 재사용할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import re\r
    import pydantic\r
    from typing import Annotated, Optional\r
    from pydantic import BaseModel, Field, BeforeValidator, AfterValidator, ValidationError\r
  exercise:\r
    prompt: 라이브러리 로드 예제에서 import한 모듈의 별칭이나 바로 이어지는 확인 호출을 바꿔 준비 상태를 확인하세요.\r
    starterCode: |-\r
      import re\r
      import pydantic\r
      from typing import Annotated, Optional\r
      from pydantic import BaseModel, Field, BeforeValidator, AfterValidator, ValidationError\r
    hints:\r
    - 바꿀 지점은 외부 입력을 만드는 첫 줄과 스키마 검증 줄에서 찾으세요.\r
    - 실행 뒤 성공 모델과 오류 메시지 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 라이브러리 로드의 import 대상 모듈과 별칭이 현재 로컬 환경에서 준비되어야 합니다.\r
    resultCheck: 라이브러리 로드 실행 결과가 성공 모델과 오류 메시지 기준으로 바꾼 입력값을 반영해야 합니다.\r
- id: annotated\r
  title: Annotated 기초\r
  structuredPrimary: true\r
  subtitle: 타입에 메타데이터 추가\r
  goal: Annotated 기초에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    Annotated[타입, 메타데이터]로 기존 타입에 검증 규칙을 추가합니다. Field의 제약조건(gt, min_length 등)을 타입 자체에 포함시키면 모든 필드에서 동일한 규칙을 적용할 수 있습니다.\r
\r
    PositiveInt를 사용하는 모든 필드에 gt=0 제약이 자동 적용됩니다. 규칙 변경 시 타입 정의만 수정하면 됩니다.\r
  snippet: |-\r
    PositiveInt = Annotated[int, Field(gt=0)]\r
    ShortString = Annotated[str, Field(max_length=50)]\r
\r
    class Product(BaseModel):\r
        productId: PositiveInt\r
        name: ShortString\r
        price: PositiveInt\r
\r
    product = Product(productId=1, name="Laptop", price=999)\r
    product\r
  exercise:\r
    prompt: Annotated 기초 예제에서 모델 필드나 입력 dict 값을 바꾸고 검증/직렬화 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      PositiveInt = Annotated[int, Field(gt=0)]\r
      ShortString = Annotated[str, Field(max_length=50)]\r
\r
      class Product(BaseModel):\r
          productId: PositiveInt\r
          name: ShortString\r
          price: PositiveInt\r
\r
      product = Product(productId=1, name="Laptop", price=999)\r
      product\r
    hints:\r
    - 바꿀 지점은 모델 필드 선언, 입력 dict, 생성 인자입니다.\r
    - 실행 뒤 model_dump(), 오류 메시지, 반환값이 바꾼 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: Annotated 기초에서 \`PositiveInt\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: Annotated 기초 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: aftervalidator\r
  title: AfterValidator\r
  structuredPrimary: true\r
  subtitle: 값 변환과 검증\r
  goal: AfterValidator에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: AfterValidator는 타입 변환 후 추가 검증이나 정규화를 수행합니다. 이메일 소문자 변환, 전화번호 형식 통일, 공백 제거 등에 활용합니다. 함수에서\r
    ValueError를 발생시키면 검증 실패로 처리됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    def normalizeEmail(v: str) -> str:\r
        return v.lower().strip()\r
\r
    NormalizedEmail = Annotated[str, AfterValidator(normalizeEmail)]\r
\r
    class User(BaseModel):\r
        email: NormalizedEmail\r
\r
    user = User(email="  ALICE@EXAMPLE.COM  ")\r
    user.email\r
  exercise:\r
    prompt: AfterValidator 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      def normalizeEmail(v: str) -> str:\r
          return v.lower().strip()\r
\r
      NormalizedEmail = Annotated[str, AfterValidator(normalizeEmail)]\r
\r
      class User(BaseModel):\r
          email: NormalizedEmail\r
\r
      user = User(email="  ALICE@EXAMPLE.COM  ")\r
      user.email\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    noError: AfterValidator의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: AfterValidator 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: beforevalidator\r
  title: BeforeValidator\r
  structuredPrimary: true\r
  subtitle: 사전 변환\r
  goal: BeforeValidator에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: BeforeValidator는 타입 변환 전에 실행됩니다. 다양한 형식의 입력을 통일하거나, 특수한 값을 처리할 때 유용합니다. 날짜 문자열을 여러 형식으로\r
    받거나, yes/no를 bool로 변환하는 등에 활용합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    def parseBoolean(v):\r
        if isinstance(v, bool):\r
            return v\r
        if isinstance(v, str):\r
            if v.lower() in ('true', 'yes', '1', 'on', 'y'):\r
                return True\r
            if v.lower() in ('false', 'no', '0', 'off', 'n'):\r
                return False\r
        raise ValueError(f"불리언으로 변환 불가: {v}")\r
\r
    FlexBool = Annotated[bool, BeforeValidator(parseBoolean)]\r
\r
    class Settings(BaseModel):\r
        debug: FlexBool\r
        cache: FlexBool\r
\r
    settings = Settings(debug="yes", cache="off")\r
    settings.debug, settings.cache\r
  exercise:\r
    prompt: BeforeValidator 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      def parseBoolean(v):\r
          if isinstance(v, bool):\r
              return v\r
          if isinstance(v, str):\r
              if v.lower() in ('true', 'yes', '1', 'on', 'y'):\r
                  return True\r
              if v.lower() in ('false', 'no', '0', 'off', 'n'):\r
                  return False\r
          raise ValueError(f"불리언으로 변환 불가: {v}")\r
\r
      FlexBool = Annotated[bool, BeforeValidator(parseBoolean)]\r
\r
      class Settings(BaseModel):\r
          debug: FlexBool\r
          cache: FlexBool\r
\r
      settings = Settings(debug="yes", cache="off")\r
      settings.debug, settings.cache\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    noError: BeforeValidator의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: BeforeValidator 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: combined\r
  title: 검증기 조합\r
  structuredPrimary: true\r
  subtitle: 다중 검증기 체인\r
  goal: 검증기 조합에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: 여러 검증기를 조합하여 복잡한 변환 파이프라인을 구성할 수 있습니다. BeforeValidator로 전처리하고, AfterValidator로 후처리하는 식으로\r
    단계별 검증을 구현합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    def stripWhitespace(v: str) -> str:\r
        return v.strip()\r
\r
    def validateNotEmpty(v: str) -> str:\r
        if not v:\r
            raise ValueError("빈 문자열 불허")\r
        return v\r
\r
    def capitalizeFirst(v: str) -> str:\r
        return v.capitalize()\r
\r
    CleanName = Annotated[\r
        str,\r
        BeforeValidator(stripWhitespace),\r
        AfterValidator(validateNotEmpty),\r
        AfterValidator(capitalizeFirst)\r
    ]\r
\r
    class Person(BaseModel):\r
        name: CleanName\r
\r
    person = Person(name="  alice  ")\r
    person.name\r
  exercise:\r
    prompt: 검증기 조합 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      def stripWhitespace(v: str) -> str:\r
          return v.strip()\r
\r
      def validateNotEmpty(v: str) -> str:\r
          if not v:\r
              raise ValueError("빈 문자열 불허")\r
          return v\r
\r
      def capitalizeFirst(v: str) -> str:\r
          return v.capitalize()\r
\r
      CleanName = Annotated[\r
          str,\r
          BeforeValidator(stripWhitespace),\r
          AfterValidator(validateNotEmpty),\r
          AfterValidator(capitalizeFirst)\r
      ]\r
\r
      class Person(BaseModel):\r
          name: CleanName\r
\r
      person = Person(name="  alice  ")\r
      person.name\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    noError: 검증기 조합의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 검증기 조합 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: constrained\r
  title: 제약 타입\r
  structuredPrimary: true\r
  subtitle: constr, conint, confloat\r
  goal: 제약 타입에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: Pydantic은 자주 사용되는 제약 타입을 제공합니다. constr은 문자열 길이와 패턴을, conint와 confloat는 숫자 범위를 제한합니다. 간단한\r
    제약에는 이들을 사용하고, 복잡한 로직은 AfterValidator를 사용합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    from pydantic import constr, conint, confloat\r
\r
    Username = constr(min_length=3, max_length=20, pattern=r'^[a-zA-Z0-9_]+$')\r
    Age = conint(ge=0, le=150)\r
    Price = confloat(gt=0, le=100000000)\r
\r
    class Account(BaseModel):\r
        username: Username\r
        age: Age\r
        balance: Price\r
\r
    account = Account(username="alice_123", age=25, balance=10000.50)\r
    account\r
  exercise:\r
    prompt: 제약 타입 예제에서 모델 필드나 입력 dict 값을 바꾸고 검증/직렬화 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      from pydantic import constr, conint, confloat\r
\r
      Username = constr(min_length=3, max_length=20, pattern=r'^[a-zA-Z0-9_]+$')\r
      Age = conint(ge=0, le=150)\r
      Price = confloat(gt=0, le=100000000)\r
\r
      class Account(BaseModel):\r
          username: Username\r
          age: Age\r
          balance: Price\r
\r
      account = Account(username="alice_123", age=25, balance=10000.50)\r
      account\r
    hints:\r
    - 바꿀 지점은 모델 필드 선언, 입력 dict, 생성 인자입니다.\r
    - 실행 뒤 model_dump(), 오류 메시지, 반환값이 바꾼 입력을 반영하는지 보세요.\r
  check:\r
    noError: 제약 타입의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.\r
    resultCheck: 제약 타입의 실행 결과가 본문 기대값과 일치해야 합니다.\r
- id: string\r
  title: 문자열 제약\r
  structuredPrimary: true\r
  subtitle: StringConstraints\r
  goal: 문자열 제약에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: StringConstraints는 문자열에 대한 상세한 제약을 정의합니다. 길이, 패턴 외에도 자동 소문자 변환(to_lower), 공백 제거(strip_whitespace)\r
    등의 변환도 포함할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    from pydantic import StringConstraints\r
\r
    SlugType = Annotated[str, StringConstraints(\r
        min_length=3,\r
        max_length=50,\r
        pattern=r'^[a-z0-9]+(?:-[a-z0-9]+)*$',\r
        to_lower=True,\r
        strip_whitespace=True\r
    )]\r
\r
    class Article(BaseModel):\r
        slug: SlugType\r
\r
    article = Article(slug="  my-first-post  ")\r
    article.slug\r
  exercise:\r
    prompt: 문자열 제약 예제에서 모델 필드나 입력 dict 값을 바꾸고 검증/직렬화 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      from pydantic import StringConstraints\r
\r
      SlugType = Annotated[str, StringConstraints(\r
          min_length=3,\r
          max_length=50,\r
          pattern=r'^[a-z0-9]+(?:-[a-z0-9]+)*$',\r
          to_lower=True,\r
          strip_whitespace=True\r
      )]\r
\r
      class Article(BaseModel):\r
          slug: SlugType\r
\r
      article = Article(slug="  my-first-post  ")\r
      article.slug\r
    hints:\r
    - 바꿀 지점은 모델 필드 선언, 입력 dict, 생성 인자입니다.\r
    - 실행 뒤 model_dump(), 오류 메시지, 반환값이 바꾼 입력을 반영하는지 보세요.\r
  check:\r
    noError: 문자열 제약의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.\r
    resultCheck: 문자열 제약의 실행 결과가 본문 기대값과 일치해야 합니다.\r
- id: domain\r
  title: 도메인 타입\r
  structuredPrimary: true\r
  subtitle: 한국형 비즈니스 타입\r
  goal: 도메인 타입에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: 실제 비즈니스에서 필요한 한국형 데이터 타입을 정의합니다. 사업자등록번호, 주민등록번호 앞자리, 우편번호 등 한국 시장에 특화된 검증 로직을 타입으로 캡슐화합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    def validateBizNumber(v: str) -> str:\r
        cleaned = re.sub(r'[^0-9]', '', v)\r
        if len(cleaned) != 10:\r
            raise ValueError("사업자등록번호는 10자리입니다")\r
        return f"{cleaned[:3]}-{cleaned[3:5]}-{cleaned[5:]}"\r
\r
    BusinessNumber = Annotated[str, AfterValidator(validateBizNumber)]\r
\r
    class Company(BaseModel):\r
        bizNumber: BusinessNumber\r
\r
    company = Company(bizNumber="123-45-67890")\r
    company.bizNumber\r
  exercise:\r
    prompt: 도메인 타입 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      def validateBizNumber(v: str) -> str:\r
          cleaned = re.sub(r'[^0-9]', '', v)\r
          if len(cleaned) != 10:\r
              raise ValueError("사업자등록번호는 10자리입니다")\r
          return f"{cleaned[:3]}-{cleaned[3:5]}-{cleaned[5:]}"\r
\r
      BusinessNumber = Annotated[str, AfterValidator(validateBizNumber)]\r
\r
      class Company(BaseModel):\r
          bizNumber: BusinessNumber\r
\r
      company = Company(bizNumber="123-45-67890")\r
      company.bizNumber\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    noError: 도메인 타입의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.\r
    resultCheck: 도메인 타입 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: library\r
  title: 타입 라이브러리\r
  structuredPrimary: true\r
  subtitle: 재사용 가능한 타입 모음\r
  goal: 타입 라이브러리에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 프로젝트에서 공통으로 사용할 타입들을 모아 라이브러리로 정리합니다. 한 곳에서 정의하고 모든 모델에서 import하여 사용하면 일관성을 유지하고 유지보수가\r
    쉬워집니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    PositiveFloat = Annotated[float, Field(gt=0)]\r
    NonNegativeInt = Annotated[int, Field(ge=0)]\r
    Percentage = Annotated[float, Field(ge=0, le=100)]\r
    NonEmptyStr = Annotated[str, Field(min_length=1)]\r
    ShortText = Annotated[str, Field(max_length=100)]\r
    LongText = Annotated[str, Field(max_length=10000)]\r
\r
    class OrderLine(BaseModel):\r
        productName: NonEmptyStr\r
        quantity: NonNegativeInt\r
        unitPrice: PositiveFloat\r
        discount: Percentage = 0\r
\r
    orderLine = OrderLine(productName="Laptop", quantity=2, unitPrice=1000000, discount=10)\r
    orderLine\r
  exercise:\r
    prompt: 타입 라이브러리 예제에서 모델 필드나 입력 dict 값을 바꾸고 검증/직렬화 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      PositiveFloat = Annotated[float, Field(gt=0)]\r
      NonNegativeInt = Annotated[int, Field(ge=0)]\r
      Percentage = Annotated[float, Field(ge=0, le=100)]\r
      NonEmptyStr = Annotated[str, Field(min_length=1)]\r
      ShortText = Annotated[str, Field(max_length=100)]\r
      LongText = Annotated[str, Field(max_length=10000)]\r
\r
      class OrderLine(BaseModel):\r
          productName: NonEmptyStr\r
          quantity: NonNegativeInt\r
          unitPrice: PositiveFloat\r
          discount: Percentage = 0\r
\r
      orderLine = OrderLine(productName="Laptop", quantity=2, unitPrice=1000000, discount=10)\r
      orderLine\r
    hints:\r
    - 바꿀 지점은 모델 필드 선언, 입력 dict, 생성 인자입니다.\r
    - 실행 뒤 model_dump(), 오류 메시지, 반환값이 바꾼 입력을 반영하는지 보세요.\r
  check:\r
    noError: 타입 라이브러리에서 \`PositiveFloat\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 타입 라이브러리 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: result\r
  title: 한국형 비즈니스 타입\r
  structuredPrimary: true\r
  subtitle: 종합 타입 라이브러리\r
  goal: 한국형 비즈니스 타입에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: 지금까지 배운 모든 기법을 종합하여 한국 비즈니스 환경에 맞는 타입 라이브러리를 완성합니다. 휴대폰 번호, 사업자등록번호, 우편번호, 금액 등을 모두 포함합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    def validateKorPhone(v: str) -> str:\r
        cleaned = re.sub(r'[^0-9]', '', v)\r
        if len(cleaned) != 11 or not cleaned.startswith('010'):\r
            raise ValueError("유효한 휴대폰 번호가 아닙니다")\r
        return f"{cleaned[:3]}-{cleaned[3:7]}-{cleaned[7:]}"\r
\r
    def validateBizNum(v: str) -> str:\r
        cleaned = re.sub(r'[^0-9]', '', v)\r
        if len(cleaned) != 10:\r
            raise ValueError("사업자등록번호는 10자리입니다")\r
        return f"{cleaned[:3]}-{cleaned[3:5]}-{cleaned[5:]}"\r
\r
    def validatePostal(v: str) -> str:\r
        cleaned = re.sub(r'[^0-9]', '', v)\r
        if len(cleaned) != 5:\r
            raise ValueError("우편번호는 5자리입니다")\r
        return cleaned\r
\r
    KoreanPhone = Annotated[str, AfterValidator(validateKorPhone)]\r
    BizNumber = Annotated[str, AfterValidator(validateBizNum)]\r
    KorPostal = Annotated[str, AfterValidator(validatePostal)]\r
    KRWAmount = Annotated[int, Field(ge=0, description="원화 금액")]\r
\r
    class BusinessEntity(BaseModel):\r
        companyName: NonEmptyStr\r
        bizNumber: BizNumber\r
        phone: KoreanPhone\r
        postalCode: KorPostal\r
        capital: KRWAmount\r
\r
    entity = BusinessEntity(\r
        companyName="테크회사",\r
        bizNumber="1234567890",\r
        phone="010.1234.5678",\r
        postalCode="06234",\r
        capital=100000000\r
    )\r
    entity\r
  exercise:\r
    prompt: 한국형 비즈니스 타입 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      def validateKorPhone(v: str) -> str:\r
          cleaned = re.sub(r'[^0-9]', '', v)\r
          if len(cleaned) != 11 or not cleaned.startswith('010'):\r
              raise ValueError("유효한 휴대폰 번호가 아닙니다")\r
          return f"{cleaned[:3]}-{cleaned[3:7]}-{cleaned[7:]}"\r
\r
      def validateBizNum(v: str) -> str:\r
          cleaned = re.sub(r'[^0-9]', '', v)\r
          if len(cleaned) != 10:\r
              raise ValueError("사업자등록번호는 10자리입니다")\r
          return f"{cleaned[:3]}-{cleaned[3:5]}-{cleaned[5:]}"\r
\r
      def validatePostal(v: str) -> str:\r
          cleaned = re.sub(r'[^0-9]', '', v)\r
          if len(cleaned) != 5:\r
              raise ValueError("우편번호는 5자리입니다")\r
          return cleaned\r
\r
      KoreanPhone = Annotated[str, AfterValidator(validateKorPhone)]\r
      BizNumber = Annotated[str, AfterValidator(validateBizNum)]\r
      KorPostal = Annotated[str, AfterValidator(validatePostal)]\r
      KRWAmount = Annotated[int, Field(ge=0, description="원화 금액")]\r
\r
      class BusinessEntity(BaseModel):\r
          companyName: NonEmptyStr\r
          bizNumber: BizNumber\r
          phone: KoreanPhone\r
          postalCode: KorPostal\r
          capital: KRWAmount\r
\r
      entity = BusinessEntity(\r
          companyName="테크회사",\r
          bizNumber="1234567890",\r
          phone="010.1234.5678",\r
          postalCode="06234",\r
          capital=100000000\r
      )\r
      entity\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    noError: 한국형 비즈니스 타입의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.\r
    resultCheck: 한국형 비즈니스 타입 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 커스텀 타입 프로젝트\r
  goal: 실습에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: |-\r
    지금까지 배운 Annotated, AfterValidator, BeforeValidator, 제약 타입을 활용하여 도메인 특화 타입을 정의합니다.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  snippet: |-\r
    from typing import Annotated\r
    from pydantic import BaseModel, Field, AfterValidator, BeforeValidator, ValidationError\r
    import re\r
\r
    def validateCardNumber(v: str) -> str:\r
        cleaned = re.sub(r'[^0-9]', '', v)\r
        if len(cleaned) != 16:\r
            raise ValueError("카드번호는 16자리입니다")\r
        return f"{cleaned[:4]}-{cleaned[4:8]}-{cleaned[8:12]}-{cleaned[12:]}"\r
\r
    def maskCard(v: str) -> str:\r
        cleaned = re.sub(r'[^0-9]', '', v)\r
        if len(cleaned) < 16:\r
            raise ValueError("카드번호는 16자리입니다")\r
        return f"{cleaned[:4]}-****-****-{cleaned[12:]}"\r
\r
    def validateCVV(v: str) -> str:\r
        if not v.isdigit() or len(v) not in (3, 4):\r
            raise ValueError("CVV는 3-4자리 숫자입니다")\r
        return v\r
\r
    CardNumber = Annotated[str, AfterValidator(validateCardNumber)]\r
    MaskedCard = Annotated[str, AfterValidator(maskCard)]\r
    CVV = Annotated[str, AfterValidator(validateCVV)]\r
    MoneyAmount = Annotated[float, Field(gt=0)]\r
\r
    class PaymentCard(BaseModel):\r
        cardNumber: CardNumber\r
        cvv: CVV\r
        expiryMonth: int = Field(ge=1, le=12)\r
        expiryYear: int = Field(ge=2024, le=2040)\r
\r
    card = PaymentCard(\r
        cardNumber="1234 5678 9012 3456",\r
        cvv="123",\r
        expiryMonth=12,\r
        expiryYear=2025\r
    )\r
    card\r
  exercise:\r
    prompt: 실습 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      from typing import Annotated\r
      from pydantic import BaseModel, Field, AfterValidator, BeforeValidator, ValidationError\r
      import re\r
\r
      def validateCardNumber(v: str) -> str:\r
          cleaned = re.sub(r'[^0-9]', '', v)\r
          if len(cleaned) != 16:\r
              raise ValueError("카드번호는 16자리입니다")\r
          return f"{cleaned[:4]}-{cleaned[4:8]}-{cleaned[8:12]}-{cleaned[12:]}"\r
\r
      def maskCard(v: str) -> str:\r
          cleaned = re.sub(r'[^0-9]', '', v)\r
          if len(cleaned) < 16:\r
              raise ValueError("카드번호는 16자리입니다")\r
          return f"{cleaned[:4]}-****-****-{cleaned[12:]}"\r
\r
      def validateCVV(v: str) -> str:\r
          if not v.isdigit() or len(v) not in (3, 4):\r
              raise ValueError("CVV는 3-4자리 숫자입니다")\r
          return v\r
\r
      CardNumber = Annotated[str, AfterValidator(validateCardNumber)]\r
      MaskedCard = Annotated[str, AfterValidator(maskCard)]\r
      CVV = Annotated[str, AfterValidator(validateCVV)]\r
      MoneyAmount = Annotated[float, Field(gt=0)]\r
\r
      class PaymentCard(BaseModel):\r
          cardNumber: CardNumber\r
          cvv: CVV\r
          expiryMonth: int = Field(ge=1, le=12)\r
          expiryYear: int = Field(ge=2024, le=2040)\r
\r
      card = PaymentCard(\r
          cardNumber="1234 5678 9012 3456",\r
          cvv="123",\r
          expiryMonth=12,\r
          expiryYear=2025\r
      )\r
      card\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
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