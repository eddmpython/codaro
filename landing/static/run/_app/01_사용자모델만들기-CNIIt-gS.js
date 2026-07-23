var e=`meta:\r
  packages:\r
  - pydantic\r
  id: pydantic_01\r
  title: 사용자모델만들기\r
  order: 1\r
  category: pydantic\r
  difficulty: ⭐\r
  badge: 입문\r
  tags:\r
  - pydantic\r
  - BaseModel\r
  - 타입힌트\r
  - 검증\r
  - 기본값\r
  seo:\r
    title: Pydantic BaseModel - 첫 번째 데이터 모델 만들기\r
    description: Pydantic의 BaseModel로 첫 번째 데이터 모델을 정의합니다. 타입 검증, 자동 변환, 에러 메시지를 배웁니다.\r
    keywords:\r
    - pydantic\r
    - BaseModel\r
    - 데이터모델\r
    - 타입검증\r
intro:\r
  emoji: 👤\r
  goal: Pydantic의 BaseModel로 사용자 프로필 관리 시스템을 구축합니다.\r
  description: 이 프로젝트에서는 실제 서비스에서 사용되는 사용자 프로필 데이터 모델을 만들어봅니다. 타입 힌트로 필드를 선언하면 인스턴스 생성 시 자동으로 검증이 이루어지고,\r
    잘못된 데이터는 명확한 에러 메시지와 함께 거부됩니다. 이 패턴은 API 개발, 데이터 처리, 설정 관리 등 모든 Python 애플리케이션의 기반이 됩니다.\r
  direction: 사용자모델만들기에서 입력 스키마를 정의하고 검증된 데이터만 처리 흐름에 넘김합니다.\r
  benefits:\r
  - 외부 입력 확인 후 스키마 검증에 맞는 코드 입력을 고릅니다.\r
  - 사용자모델만들기 결과를 성공 모델과 오류 메시지 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 API/자동화 입력 계약에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 라이브러리 로드 입력 확인\r
      detail: 입력 기준(외부 입력)과 필요한 조건을 먼저 고정합니다.\r
    - label: 기본 모델 정의 처리 실행\r
      detail: 스키마 검증 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 타입 자동 변환 결과 검증\r
      detail: 성공 모델과 오류 메시지 기준으로 실행 결과를 비교합니다.\r
    - label: 사용자모델만들기 재사용\r
      detail: 완성 코드를 API/자동화 입력 계약에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 데이터 계약 환경\r
      detail: pydantic 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 사용자모델만들기 실행\r
      detail: 셀을 실행해 성공 모델과 오류 메시지와 예외 상태를 확인합니다.\r
    - label: 사용자모델만들기 완료\r
      detail: 검증된 코드를 API/자동화 입력 계약로 남깁니다.\r
sections:\r
- id: load\r
  title: 라이브러리 로드\r
  structuredPrimary: true\r
  subtitle: Pydantic import 확인\r
  goal: 라이브러리 로드에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: import 준비가 정확해야 다음 셀과 자동화 코드에서 같은 이름을 안정적으로 재사용할 수 있습니다.\r
  explanation: Pydantic은 Python의 타입 힌트를 활용하여 런타임에 데이터를 검증하는 라이브러리입니다. V2 버전은 Rust로 작성된 pydantic-core를\r
    사용하여 V1보다 5~50배 빠른 성능을 자랑합니다. Codaro 로컬 환경에서는 필요한 패키지를 uv로 준비하며, BaseModel 클래스를 상속하여 데이터 모델을 정의합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import pydantic\r
    from pydantic import BaseModel, ValidationError\r
  exercise:\r
    prompt: 라이브러리 로드 예제에서 import한 모듈의 별칭이나 바로 이어지는 확인 호출을 바꿔 준비 상태를 확인하세요.\r
    starterCode: |-\r
      import pydantic\r
      from pydantic import BaseModel, ValidationError\r
    hints:\r
    - 바꿀 지점은 외부 입력을 만드는 첫 줄과 스키마 검증 줄에서 찾으세요.\r
    - 실행 뒤 성공 모델과 오류 메시지 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 라이브러리 로드의 import 대상 모듈과 별칭이 현재 로컬 환경에서 준비되어야 합니다.\r
    resultCheck: 라이브러리 로드 실행 결과가 성공 모델과 오류 메시지 기준으로 바꾼 입력값을 반영해야 합니다.\r
- id: define\r
  title: 기본 모델 정의\r
  structuredPrimary: true\r
  subtitle: 첫 번째 사용자 모델\r
  goal: 기본 모델 정의에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    BaseModel을 상속받고 클래스 변수로 필드를 선언합니다. Python의 타입 힌트가 곧 검증 규칙이 됩니다. 필드에 타입만 지정하면 필수 필드가 되고, 기본값을 함께 지정하면 선택적 필드가 됩니다. 이 간단한 선언만으로 강력한 데이터 검증 시스템이 완성됩니다.\r
\r
    인스턴스 생성 시 모든 필수 필드에 값을 제공해야 합니다. 누락되면 ValidationError가 발생하며, 어떤 필드가 누락되었는지 정확히 알려줍니다.\r
  snippet: |-\r
    class User(BaseModel):\r
        name: str\r
        age: int\r
        email: str\r
\r
    user = User(name="Alice", age=25, email="alice@example.com")\r
    user\r
  exercise:\r
    prompt: 기본 모델 정의 예제에서 \`user\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      class User(BaseModel):\r
          name: str\r
          age: int\r
          email: str\r
\r
      user = User(name="Alice", age=25, email="alice@example.com")\r
      user\r
    hints:\r
    - 바꿀 지점은 \`user = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`user\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 기본 모델 정의에서 \`user\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 기본 모델 정의 실행 뒤 \`user\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: coercion\r
  title: 타입 자동 변환\r
  structuredPrimary: true\r
  subtitle: 스마트 변환 기능\r
  goal: 타입 자동 변환에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    Pydantic의 강력한 기능 중 하나는 타입 강제 변환(coercion)입니다. 문자열 "30"을 int 필드에 넣으면 자동으로 정수 30으로 변환됩니다. 다만 Pydantic v2 기본 설정에서는 숫자 123을 str 필드에 넣는 변환은 허용하지 않습니다. 외부 데이터(JSON, CSV 등)를 유연하게 받되, 어떤 변환이 실제로 허용되는지는 실행으로 확인해야 합니다.\r
\r
    변환이 불가능한 경우(예: "invalid"를 int로)에는 ValidationError가 발생합니다. Pydantic은 "스마트" 변환만 수행합니다.\r
  snippet: |-\r
    converted = User(name="Bob", age="30", email="bob@test.com")\r
    converted.age, type(converted.age)\r
  exercise:\r
    prompt: 타입 자동 변환 예제에서 \`converted\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      converted = User(name="Bob", age="30", email="bob@test.com")\r
      converted.age, type(converted.age)\r
    hints:\r
    - 바꿀 지점은 \`converted = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`converted\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 타입 자동 변환에서 \`converted\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 타입 자동 변환 실행 뒤 \`converted\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: validation\r
  title: 검증 실패 처리\r
  structuredPrimary: true\r
  subtitle: ValidationError 이해하기\r
  goal: 검증 실패 처리에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    변환할 수 없는 값이 들어오면 ValidationError가 발생합니다. 이 에러 객체는 어떤 필드에서 어떤 문제가 발생했는지 상세한 정보를 제공합니다. errors() 메서드로 구조화된 에러 정보를 얻을 수 있어 API 응답이나 로깅에 활용하기 좋습니다.\r
\r
    errors() 리스트의 각 항목은 'loc'(필드 위치), 'msg'(메시지), 'type'(에러 타입), 'input'(입력값)을 포함합니다.\r
  snippet: |-\r
    from pydantic import ValidationError\r
\r
    try:\r
        invalid = User(name="Charlie", age="not_a_number", email="c@c.com")\r
    except ValidationError as exc:\r
        errorInfo = exc.errors()\r
        errorInfo\r
  exercise:\r
    prompt: 검증 실패 처리 예제에서 \`invalid\`, \`errorInfo\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      from pydantic import ValidationError\r
\r
      try:\r
          invalid = User(name="Charlie", age="not_a_number", email="c@c.com")\r
      except ValidationError as exc:\r
          errorInfo = exc.errors()\r
          errorInfo\r
    hints:\r
    - 바꿀 지점은 \`invalid = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`invalid\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 검증 실패 처리에서 \`invalid\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 검증 실패 처리 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: default\r
  title: 기본값과 Optional\r
  structuredPrimary: true\r
  subtitle: 선택적 필드 정의\r
  goal: 기본값과 Optional에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 필드에 기본값을 지정하면 인스턴스 생성 시 해당 필드를 생략할 수 있습니다. Optional[T]는 T 또는 None을 허용하는 타입입니다. 기본값과 Optional을\r
    조합하면 유연한 데이터 모델을 설계할 수 있습니다. 주의할 점은 기본값이 있는 필드는 반드시 기본값이 없는 필드 뒤에 와야 한다는 것입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    class Profile(BaseModel):\r
        username: str\r
        bio: Optional[str] = None\r
        age: int = 18\r
        active: bool = True\r
\r
    minimal = Profile(username="dave")\r
    minimal\r
  exercise:\r
    prompt: 기본값과 Optional 예제에서 입력 dict의 누락 필드나 선택 필드를 바꾸고 모델 기본값이 어떻게 채워지는지 확인하세요.\r
    starterCode: |-\r
      class Profile(BaseModel):\r
          username: str\r
          bio: Optional[str] = None\r
          age: int = 18\r
          active: bool = True\r
\r
      minimal = Profile(username="dave")\r
      minimal\r
    hints:\r
    - 바꿀 지점은 입력 dict의 누락 필드, 선택 필드, 모델 생성 인자입니다.\r
    - 실행 뒤 기본값으로 채워진 필드와 model_dump 결과가 바꾼 입력을 반영하는지 보세요.\r
  check:\r
    noError: 기본값과 Optional에서 \`minimal\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 기본값과 Optional 실행 뒤 \`minimal\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.\r
- id: serialize\r
  title: 직렬화와 역직렬화\r
  structuredPrimary: true\r
  subtitle: dict와 JSON 변환\r
  goal: 직렬화와 역직렬화에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    Pydantic 모델은 딕셔너리나 JSON으로 쉽게 변환할 수 있습니다. model_dump()는 딕셔너리로, model_dump_json()은 JSON 문자열로 변환합니다. 반대로 model_validate()는 딕셔너리에서, model_validate_json()은 JSON 문자열에서 모델 인스턴스를 생성합니다. API 개발에서 매우 자주 사용되는 패턴입니다.\r
\r
    Pydantic V2에서는 .dict() → .model_dump(), .json() → .model_dump_json()으로 메서드명이 변경되었습니다.\r
  snippet: |-\r
    userDict = user.model_dump()\r
    userDict\r
  exercise:\r
    prompt: 직렬화와 역직렬화 예제에서 \`userDict\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      userDict = user.model_dump()\r
      userDict\r
    hints:\r
    - 바꿀 지점은 \`userDict = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`userDict\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 직렬화와 역직렬화에서 \`userDict\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 직렬화와 역직렬화 실행 뒤 \`userDict\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: immutable\r
  title: 불변 모델\r
  structuredPrimary: true\r
  subtitle: frozen 설정\r
  goal: model_config의 frozen=True로 인스턴스 생성 후 필드를 바꾸지 못하게 막고, 해시 가능 객체가 되어 set/dict 키로 쓸 수 있는지 확인합니다.\r
  why: 가변 모델은 함수 호출 중 어디선가 필드가 바뀌면 추적이 어렵습니다. 불변으로 만들면 인스턴스 동일성 비교, 캐싱, 함수형 데이터 흐름이 안전해집니다.\r
  explanation: model_config에서 frozen=True를 설정하면 인스턴스 생성 후 필드 값을 수정할 수 없습니다. 이는 함수형 프로그래밍 패러다임에서 중요한 불변성(immutability)을\r
    보장합니다. 실수로 데이터를 변경하는 버그를 방지하고, 해시 가능한 객체로 만들어 딕셔너리 키나 집합 원소로 사용할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    class ImmutableUser(BaseModel):\r
        model_config = {"frozen": True}\r
        name: str\r
        age: int\r
\r
    frozen = ImmutableUser(name="Henry", age=30)\r
    frozen\r
  exercise:\r
    prompt: 불변 모델 예제에서 생성 인자나 수정 시도 값을 바꾸고 frozen 모델이 변경을 막는지 확인하세요.\r
    starterCode: |-\r
      class ImmutableUser(BaseModel):\r
          model_config = {"frozen": True}\r
          name: str\r
          age: int\r
\r
      frozen = ImmutableUser(name="Henry", age=30)\r
      frozen\r
    hints:\r
    - 바꿀 지점은 생성 인자, frozen 모델 선언, 수정 시도 코드입니다.\r
    - 실행 뒤 변경 시도가 ValidationError로 막히고 원본 모델 값이 유지되는지 보세요.\r
  check:\r
    type: noError\r
    noError: 불변 모델의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 불변 모델의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: result\r
  title: 최종 사용자 시스템\r
  structuredPrimary: true\r
  subtitle: 종합 프로필 모델\r
  goal: 필수/선택 필드, 검증, 직렬화, model_fields 메타데이터까지 결합해 운영급 사용자 모델 한 개를 종합 구성합니다.\r
  why: 강의에서 단편적으로 익힌 기법은 한 모델에 결합해야 운영에서 살아 있는 코드가 됩니다. 종합 모델 한 개가 다음 강의로 이어지는 기준점이 됩니다.\r
  explanation: 지금까지 배운 모든 개념을 종합하여 실제 서비스에서 사용할 수 있는 사용자 프로필 시스템을 완성합니다. 필수 필드와 선택적 필드를 적절히 조합하고, model_fields로\r
    스키마 정보를 확인하며, 다양한 직렬화 옵션을 활용합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    class UserProfile(BaseModel):\r
        model_config = {"frozen": False}\r
\r
        userId: str\r
        username: str\r
        email: str\r
        displayName: Optional[str] = None\r
        age: Optional[int] = None\r
        isActive: bool = True\r
        role: str = "user"\r
\r
    profile = UserProfile(\r
        userId="usr_001",\r
        username="alice",\r
        email="alice@example.com",\r
        displayName="Alice Kim",\r
        age=25\r
    )\r
    profile\r
  exercise:\r
    prompt: 최종 사용자 시스템 예제에서 사용자 프로필 입력값을 바꾸고 검증된 모델과 model_dump 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      class UserProfile(BaseModel):\r
          model_config = {"frozen": False}\r
\r
          userId: str\r
          username: str\r
          email: str\r
          displayName: Optional[str] = None\r
          age: Optional[int] = None\r
          isActive: bool = True\r
          role: str = "user"\r
\r
      profile = UserProfile(\r
          userId="usr_001",\r
          username="alice",\r
          email="alice@example.com",\r
          displayName="Alice Kim",\r
          age=25\r
      )\r
      profile\r
    hints:\r
    - 바꿀 지점은 사용자 프로필 필드, 중첩 값, 직렬화 대상입니다.\r
    - 실행 뒤 생성된 모델 필드와 직렬화 결과가 바꾼 입력을 반영하는지 보세요.\r
  check:\r
    noError: 최종 사용자 시스템의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 최종 사용자 시스템의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 모델 정의 프로젝트\r
  goal: 실습에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    지금까지 배운 BaseModel, 타입 검증, 기본값, 직렬화를 활용하여 다양한 도메인의 데이터 모델을 만들어봅니다.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  snippet: |-\r
    from pydantic import BaseModel\r
    from typing import Optional\r
\r
    class Product(BaseModel):\r
        productId: str\r
        name: str\r
        price: float\r
        quantity: int = 0\r
        description: Optional[str] = None\r
        isAvailable: bool = True\r
\r
    laptop = Product(\r
        productId="P001",\r
        name="MacBook Pro",\r
        price=2500000,\r
        quantity=10,\r
        description="M3 Pro chip"\r
    )\r
    laptop\r
  exercise:\r
    prompt: 실습 예제에서 상품 모델 필드와 입력값을 바꾸고 검증/직렬화 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      from pydantic import BaseModel\r
      from typing import Optional\r
\r
      class Product(BaseModel):\r
          productId: str\r
          name: str\r
          price: float\r
          quantity: int = 0\r
          description: Optional[str] = None\r
          isAvailable: bool = True\r
\r
      laptop = Product(\r
          productId="P001",\r
          name="MacBook Pro",\r
          price=2500000,\r
          quantity=10,\r
          description="M3 Pro chip"\r
      )\r
      laptop\r
    hints:\r
    - 바꿀 지점은 모델 필드 선언, 입력 dict, 생성 인자입니다.\r
    - 실행 뒤 model_dump(), 오류 메시지, 반환값이 바꾼 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 실습에서 \`laptop\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 실습 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
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