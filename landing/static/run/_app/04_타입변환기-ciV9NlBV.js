var e=`meta:\r
  packages:\r
  - pydantic\r
  id: pydantic_04\r
  title: 타입변환기\r
  order: 4\r
  category: pydantic\r
  difficulty: ⭐⭐\r
  badge: 기본\r
  tags:\r
  - pydantic\r
  - coercion\r
  - 타입변환\r
  - strict\r
  - serializer\r
  seo:\r
    title: Pydantic 타입 변환 - 자동 변환과 엄격 모드\r
    description: Pydantic의 타입 변환 동작을 이해합니다. 자동 강제 변환, 엄격 모드, 커스텀 직렬화를 배웁니다.\r
    keywords:\r
    - pydantic\r
    - 타입변환\r
    - coercion\r
    - strict\r
    - serializer\r
intro:\r
  emoji: 🔄\r
  goal: Pydantic의 타입 변환과 직렬화를 제어합니다.\r
  description: 자동 타입 강제 변환의 동작을 이해하고, 엄격 모드와 커스텀 직렬화기로 세밀하게 제어합니다.\r
  direction: 타입변환기에서 입력 스키마를 정의하고 검증된 데이터만 처리 흐름에 넘김합니다.\r
  benefits:\r
  - 외부 입력 확인 후 스키마 검증에 맞는 코드 입력을 고릅니다.\r
  - 타입변환기 결과를 성공 모델과 오류 메시지 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 API/자동화 입력 계약에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. pydantic import 확인\r
      detail: 입력 기준(외부 입력)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 자동 타입 변환 처리 실행\r
      detail: 스키마 검증 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 엄격 모드 결과 검증\r
      detail: 성공 모델과 오류 메시지 기준으로 실행 결과를 비교합니다.\r
    - label: 타입변환기 재사용\r
      detail: 완성 코드를 API/자동화 입력 계약에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 데이터 계약 환경\r
      detail: pydantic 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 타입변환기 실행\r
      detail: 셀을 실행해 성공 모델과 오류 메시지와 예외 상태를 확인합니다.\r
    - label: 타입변환기 완료\r
      detail: 검증된 코드를 API/자동화 입력 계약로 남깁니다.\r
sections:\r
- id: step1_package_ready\r
  title: 1단계. pydantic import 확인\r
  structuredPrimary: true\r
  subtitle: pydantic 모듈\r
  goal: 1단계. pydantic import 확인에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: import 준비가 정확해야 다음 셀과 자동화 코드에서 같은 이름을 안정적으로 재사용할 수 있습니다.\r
  explanation: Pydantic은 가능한 경우 입력값을 대상 타입으로 자동 변환합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: import pydantic\r
  exercise:\r
    prompt: 1단계. pydantic import 확인 예제에서 import한 모듈의 별칭이나 바로 이어지는 확인 호출을 바꿔 준비 상태를 확인하세요.\r
    starterCode: import pydantic\r
    hints:\r
    - 바꿀 지점은 외부 입력을 만드는 첫 줄과 스키마 검증 줄에서 찾으세요.\r
    - 실행 뒤 성공 모델과 오류 메시지 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 1단계. pydantic import 확인의 대상 모듈과 별칭이 현재 로컬 환경에서 준비되어야 합니다.\r
    resultCheck: 1단계. pydantic import 확인 다음 셀에서 import한 이름을 사용할 수 있어야 합니다.\r
- id: step2_auto_coercion\r
  title: 2단계. 자동 타입 변환\r
  structuredPrimary: true\r
  subtitle: 기본 동작\r
  goal: 2단계. 자동 타입 변환에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    Pydantic v2는 문자열 숫자를 int/float로, 1/0 같은 값을 bool로 변환하지만 숫자를 문자열로 자동 변환하지는 않습니다. 문자열 필드는 실제 문자열을 넣어야 합니다.\r
\r
    1, "1", "true", "yes", "on"은 True로, 0, "0", "false", "no", "off"는 False로 변환됩니다. int를 str로 받고 싶다면 직접 str(value)를 호출하거나 field_validator(mode='before')로 변환 규칙을 명시하세요.\r
  tips:\r
  - 1, "1", "true", "yes", "on"은 True로, 0, "0", "false", "no", "off"는 False로 변환됩니다. int를 str로 받고 싶다면 직접\r
    str(value)를 호출하거나 field_validator(mode='before')로 변환 규칙을 명시하세요.\r
  snippet: |-\r
    from pydantic import BaseModel\r
\r
    class Data(BaseModel):\r
        intVal: int\r
        floatVal: float\r
        strVal: str\r
        boolVal: bool\r
\r
    data1 = Data(intVal="123", floatVal="45.67", strVal="999", boolVal=1)\r
    data1\r
  exercise:\r
    prompt: 2단계. 자동 타입 변환 예제에서 \`data1\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      from pydantic import BaseModel\r
\r
      class Data(BaseModel):\r
          intVal: int\r
          floatVal: float\r
          strVal: str\r
          boolVal: bool\r
\r
      data1 = Data(intVal="123", floatVal="45.67", strVal="999", boolVal=1)\r
      data1\r
    hints:\r
    - 바꿀 지점은 \`data1 = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`data1\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 2단계. 자동 타입 변환에서 \`data1\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 2단계. 자동 타입 변환 실행 뒤 \`data1\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: step3_strict_mode\r
  title: 3단계. 엄격 모드\r
  structuredPrimary: true\r
  subtitle: strict=True\r
  goal: model_config의 strict=True로 타입 강제 변환을 끄고, 문자열 "5"가 int 필드에 들어갈 때 ValidationError가 나는지 확인합니다.\r
  why: 자동 변환은 편하지만 운영에서 "5"가 의도된 입력인지 실수인지 구분하지 못합니다. 엄격 모드는 입력 타입을 명시적으로 요구해 데이터 계약을 더 강하게 만듭니다.\r
  explanation: |-\r
    model_config에서 strict=True를 설정하면 타입 강제 변환이 비활성화됩니다.\r
\r
    엄격 모드에서는 정확한 타입만 허용됩니다. int 필드에 문자열 "123"을 넣으면 실패합니다.\r
  snippet: |-\r
    class StrictData(BaseModel):\r
        model_config = {"strict": True}\r
        intVal: int\r
        strVal: str\r
\r
    strictData = StrictData(intVal=123, strVal="hello")\r
    strictData\r
  exercise:\r
    prompt: 3단계. 엄격 모드 예제에서 입력 타입을 바꾸고 strict=True가 자동 변환을 막는지 확인하세요.\r
    starterCode: |-\r
      class StrictData(BaseModel):\r
          model_config = {"strict": True}\r
          intVal: int\r
          strVal: str\r
\r
      strictData = StrictData(intVal=123, strVal="hello")\r
      strictData\r
    hints:\r
    - 바꿀 지점은 strict 필드 선언과 모델 생성 입력 타입입니다.\r
    - 실행 뒤 자동 변환이 허용되는 값과 거부되는 값이 의도대로 갈리는지 보세요.\r
  check:\r
    type: noError\r
    noError: 3단계. 엄격 모드의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 3단계. 엄격 모드의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step4_field_strict\r
  title: 4단계. 필드별 엄격 모드\r
  structuredPrimary: true\r
  subtitle: Field(strict=True)\r
  goal: 4단계. 필드별 엄격 모드에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 특정 필드만 엄격 모드로 설정할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    from pydantic import Field\r
\r
    class MixedData(BaseModel):\r
        flexibleInt: int\r
        strictInt: int = Field(strict=True)\r
        flexibleStr: str\r
\r
    mixed1 = MixedData(flexibleInt="100", strictInt=200, flexibleStr="300")\r
    mixed1\r
  exercise:\r
    prompt: 4단계. 필드별 엄격 모드 예제에서 \`mixed1\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      from pydantic import Field\r
\r
      class MixedData(BaseModel):\r
          flexibleInt: int\r
          strictInt: int = Field(strict=True)\r
          flexibleStr: str\r
\r
      mixed1 = MixedData(flexibleInt="100", strictInt=200, flexibleStr="300")\r
      mixed1\r
    hints:\r
    - 바꿀 지점은 \`mixed1 = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`mixed1\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 4단계. 필드별 엄격 모드에서 \`mixed1\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 4단계. 필드별 엄격 모드 실행 뒤 \`mixed1\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: step5_datetime\r
  title: 5단계. 날짜/시간 변환\r
  structuredPrimary: true\r
  subtitle: datetime 타입\r
  goal: 5단계. 날짜/시간 변환에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: Pydantic은 문자열을 datetime, date, time 객체로 자동 변환합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    from datetime import datetime, date, time\r
\r
    class Event(BaseModel):\r
        eventName: str\r
        eventDate: date\r
        startTime: time\r
        createdAt: datetime\r
\r
    event1 = Event(\r
        eventName="Conference",\r
        eventDate="2024-06-15",\r
        startTime="09:30:00",\r
        createdAt="2024-01-01T12:00:00"\r
    )\r
    event1\r
  exercise:\r
    prompt: 5단계. 날짜/시간 변환 예제에서 \`event1\`, \`eventName\`, \`eventDate\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      from datetime import datetime, date, time\r
\r
      class Event(BaseModel):\r
          eventName: str\r
          eventDate: date\r
          startTime: time\r
          createdAt: datetime\r
\r
      event1 = Event(\r
          eventName="Conference",\r
          eventDate="2024-06-15",\r
          startTime="09:30:00",\r
          createdAt="2024-01-01T12:00:00"\r
      )\r
      event1\r
    hints:\r
    - 바꿀 지점은 \`event1 = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`event1\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 5단계. 날짜/시간 변환에서 \`event1\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 5단계. 날짜/시간 변환 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step6_enum\r
  title: 6단계. Enum 타입\r
  structuredPrimary: true\r
  subtitle: 열거형 변환\r
  goal: 6단계. Enum 타입에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: Enum 타입은 문자열이나 값으로 자동 변환됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    from enum import Enum\r
\r
    class Status(str, Enum):\r
        PENDING = "pending"\r
        ACTIVE = "active"\r
        COMPLETED = "completed"\r
\r
    class Task(BaseModel):\r
        taskId: str\r
        status: Status\r
\r
    task1 = Task(taskId="T001", status="active")\r
    task1\r
  exercise:\r
    prompt: 6단계. Enum 타입 예제에서 \`PENDING\`, \`ACTIVE\`, \`COMPLETED\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      from enum import Enum\r
\r
      class Status(str, Enum):\r
          PENDING = "pending"\r
          ACTIVE = "active"\r
          COMPLETED = "completed"\r
\r
      class Task(BaseModel):\r
          taskId: str\r
          status: Status\r
\r
      task1 = Task(taskId="T001", status="active")\r
      task1\r
    hints:\r
    - 바꿀 지점은 \`PENDING = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`PENDING\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 6단계. Enum 타입에서 \`PENDING\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 6단계. Enum 타입 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step7_literal\r
  title: 7단계. Literal 타입\r
  structuredPrimary: true\r
  subtitle: 특정 값만 허용\r
  goal: 7단계. Literal 타입에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: Literal로 필드가 가질 수 있는 값을 제한합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    from typing import Literal\r
\r
    class Priority(BaseModel):\r
        level: Literal["low", "medium", "high"]\r
        score: Literal[1, 2, 3, 4, 5]\r
\r
    priority1 = Priority(level="high", score=5)\r
    priority1\r
  exercise:\r
    prompt: 7단계. Literal 타입 예제에서 허용값과 입력값을 바꾸고 검증 성공/실패가 달라지는지 확인하세요.\r
    starterCode: |-\r
      from typing import Literal\r
\r
      class Priority(BaseModel):\r
          level: Literal["low", "medium", "high"]\r
          score: Literal[1, 2, 3, 4, 5]\r
\r
      priority1 = Priority(level="high", score=5)\r
      priority1\r
    hints:\r
    - 바꿀 지점은 \`Literal[...]\`의 허용값과 모델 생성 입력입니다.\r
    - 실행 뒤 허용된 값은 통과하고 벗어난 값은 검증 오류로 잡히는지 보세요.\r
  check:\r
    type: noError\r
    noError: 7단계. Literal 타입에서 \`priority1\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 7단계. Literal 타입 실행 뒤 \`priority1\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.\r
- id: step8_serializer\r
  title: 8단계. 필드 직렬화기\r
  structuredPrimary: true\r
  subtitle: field_serializer\r
  goal: 8단계. 필드 직렬화기에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: field_serializer로 필드의 직렬화 방식을 커스터마이즈합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    from pydantic import field_serializer\r
\r
    class Article(BaseModel):\r
        title: str\r
        publishedAt: datetime\r
\r
        @field_serializer('publishedAt')\r
        def serializeDate(self, v: datetime) -> str:\r
            return v.strftime("%Y년 %m월 %d일")\r
\r
    article1 = Article(title="뉴스 기사", publishedAt="2024-03-15T10:30:00")\r
    article1.model_dump()\r
  exercise:\r
    prompt: 8단계. 필드 직렬화기 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      from pydantic import field_serializer\r
\r
      class Article(BaseModel):\r
          title: str\r
          publishedAt: datetime\r
\r
          @field_serializer('publishedAt')\r
          def serializeDate(self, v: datetime) -> str:\r
              return v.strftime("%Y년 %m월 %d일")\r
\r
      article1 = Article(title="뉴스 기사", publishedAt="2024-03-15T10:30:00")\r
      article1.model_dump()\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 8단계. 필드 직렬화기의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 8단계. 필드 직렬화기 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: step9_computed\r
  title: 9단계. 계산 필드 직렬화\r
  structuredPrimary: true\r
  subtitle: computed_field\r
  goal: 9단계. 계산 필드 직렬화에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: computed_field로 다른 필드에서 계산된 값을 직렬화에 포함합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    from pydantic import computed_field\r
\r
    class Invoice(BaseModel):\r
        itemPrice: float\r
        quantity: int\r
        taxRate: float = 10\r
\r
        @computed_field\r
        @property\r
        def subtotal(self) -> float:\r
            return self.itemPrice * self.quantity\r
\r
        @computed_field\r
        @property\r
        def tax(self) -> float:\r
            return self.subtotal * self.taxRate / 100\r
\r
        @computed_field\r
        @property\r
        def total(self) -> float:\r
            return self.subtotal + self.tax\r
\r
    invoice1 = Invoice(itemPrice=10000, quantity=3)\r
    invoice1.model_dump()\r
  exercise:\r
    prompt: 9단계. 계산 필드 직렬화 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      from pydantic import computed_field\r
\r
      class Invoice(BaseModel):\r
          itemPrice: float\r
          quantity: int\r
          taxRate: float = 10\r
\r
          @computed_field\r
          @property\r
          def subtotal(self) -> float:\r
              return self.itemPrice * self.quantity\r
\r
          @computed_field\r
          @property\r
          def tax(self) -> float:\r
              return self.subtotal * self.taxRate / 100\r
\r
          @computed_field\r
          @property\r
          def total(self) -> float:\r
              return self.subtotal + self.tax\r
\r
      invoice1 = Invoice(itemPrice=10000, quantity=3)\r
      invoice1.model_dump()\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 9단계. 계산 필드 직렬화의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 9단계. 계산 필드 직렬화 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: step10_mode\r
  title: 10단계. 직렬화 모드\r
  structuredPrimary: true\r
  subtitle: mode 파라미터\r
  goal: 10단계. 직렬화 모드에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    model_dump의 mode 파라미터로 직렬화 형식을 제어합니다.\r
\r
    mode='python'은 Python 객체를 유지하고, mode='json'은 JSON 직렬화 가능한 형태로 변환합니다.\r
  snippet: |-\r
    class Sample(BaseModel):\r
        createdAt: datetime\r
        price: float\r
\r
    sample1 = Sample(createdAt="2024-01-15T10:00:00", price=99.99)\r
    pythonMode = sample1.model_dump(mode='python')\r
    pythonMode\r
  exercise:\r
    prompt: 10단계. 직렬화 모드 예제에서 \`sample1\`, \`pythonMode\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      class Sample(BaseModel):\r
          createdAt: datetime\r
          price: float\r
\r
      sample1 = Sample(createdAt="2024-01-15T10:00:00", price=99.99)\r
      pythonMode = sample1.model_dump(mode='python')\r
      pythonMode\r
    hints:\r
    - 바꿀 지점은 \`sample1 = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`sample1\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 10단계. 직렬화 모드에서 \`sample1\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 10단계. 직렬화 모드 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step11_exclude\r
  title: 11단계. 필드 제외\r
  structuredPrimary: true\r
  subtitle: exclude, include\r
  goal: 11단계. 필드 제외에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: model_dump에서 특정 필드를 제외하거나 포함할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    class UserProfile(BaseModel):\r
        userId: str\r
        username: str\r
        password: str\r
        email: str\r
\r
    profile1 = UserProfile(userId="U001", username="alice", password="secret123", email="alice@mail.com")\r
    safeProfile = profile1.model_dump(exclude={"password"})\r
    safeProfile\r
  exercise:\r
    prompt: 11단계. 필드 제외 예제에서 \`profile1\`, \`safeProfile\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      class UserProfile(BaseModel):\r
          userId: str\r
          username: str\r
          password: str\r
          email: str\r
\r
      profile1 = UserProfile(userId="U001", username="alice", password="secret123", email="alice@mail.com")\r
      safeProfile = profile1.model_dump(exclude={"password"})\r
      safeProfile\r
    hints:\r
    - 바꿀 지점은 \`profile1 = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`profile1\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 11단계. 필드 제외에서 \`profile1\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 11단계. 필드 제외 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step12_alias_serial\r
  title: 12단계. 별칭 직렬화\r
  structuredPrimary: true\r
  subtitle: by_alias\r
  goal: 12단계. 별칭 직렬화에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: by_alias=True로 직렬화 시 별칭을 사용합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    class ApiData(BaseModel):\r
        userId: int = Field(alias="user_id")\r
        userName: str = Field(alias="user_name")\r
\r
    apiData1 = ApiData(user_id=1, user_name="Alice")\r
\r
    normalDump = apiData1.model_dump()\r
    aliasDump = apiData1.model_dump(by_alias=True)\r
    normalDump, aliasDump\r
  exercise:\r
    prompt: 12단계. 별칭 직렬화 예제에서 \`apiData1\`, \`normalDump\`, \`aliasDump\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      class ApiData(BaseModel):\r
          userId: int = Field(alias="user_id")\r
          userName: str = Field(alias="user_name")\r
\r
      apiData1 = ApiData(user_id=1, user_name="Alice")\r
\r
      normalDump = apiData1.model_dump()\r
      aliasDump = apiData1.model_dump(by_alias=True)\r
      normalDump, aliasDump\r
    hints:\r
    - 바꿀 지점은 \`apiData1 = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`apiData1\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 12단계. 별칭 직렬화에서 \`apiData1\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 12단계. 별칭 직렬화 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 타입 변환 프로젝트\r
  goal: 실습에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: 다양한 타입 변환과 직렬화를 적용합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    from pydantic import BaseModel, Field, field_serializer, computed_field\r
    from datetime import datetime\r
    from typing import Literal\r
\r
    class ApiResponse(BaseModel):\r
        statusCode: int = Field(alias="status_code")\r
        message: str\r
        timestamp: datetime\r
        responseTime: float = Field(alias="response_time_ms")\r
\r
        @field_serializer('timestamp')\r
        def formatTimestamp(self, v: datetime) -> str:\r
            return v.isoformat()\r
\r
        @computed_field\r
        @property\r
        def isSuccess(self) -> bool:\r
            return 200 <= self.statusCode < 300\r
\r
    resp = ApiResponse(\r
        status_code=200,\r
        message="Success",\r
        timestamp="2024-03-15T10:30:00",\r
        response_time_ms=45.5\r
    )\r
    respOutput = {\r
        "normal": resp.model_dump(),\r
        "alias": resp.model_dump(by_alias=True)\r
    }\r
    respOutput\r
  exercise:\r
    prompt: 실습 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      from pydantic import BaseModel, Field, field_serializer, computed_field\r
      from datetime import datetime\r
      from typing import Literal\r
\r
      class ApiResponse(BaseModel):\r
          statusCode: int = Field(alias="status_code")\r
          message: str\r
          timestamp: datetime\r
          responseTime: float = Field(alias="response_time_ms")\r
\r
          @field_serializer('timestamp')\r
          def formatTimestamp(self, v: datetime) -> str:\r
              return v.isoformat()\r
\r
          @computed_field\r
          @property\r
          def isSuccess(self) -> bool:\r
              return 200 <= self.statusCode < 300\r
\r
      resp = ApiResponse(\r
          status_code=200,\r
          message="Success",\r
          timestamp="2024-03-15T10:30:00",\r
          response_time_ms=45.5\r
      )\r
      respOutput = {\r
          "normal": resp.model_dump(),\r
          "alias": resp.model_dump(by_alias=True)\r
      }\r
      respOutput\r
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