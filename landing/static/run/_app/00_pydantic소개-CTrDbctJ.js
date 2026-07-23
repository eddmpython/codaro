var e=`meta:\r
  packages:\r
  - pydantic\r
  id: pydantic_00\r
  title: pydantic소개\r
  order: 0\r
  category: pydantic\r
  badge: 소개\r
  source: eddmpython\r
  sourceUrl: https://eddmpython.com\r
  tags:\r
  - pydantic\r
  - 데이터검증\r
  - 타입힌트\r
  - 모델\r
  - 직렬화\r
  seo:\r
    title: Pydantic 입문 - Python 데이터 검증의 표준\r
    description: Pydantic으로 데이터 검증과 설정 관리를 시작하세요. 타입 힌트 기반의 강력한 데이터 모델링 라이브러리입니다.\r
    keywords:\r
    - pydantic\r
    - 데이터검증\r
    - 타입힌트\r
    - BaseModel\r
    - 직렬화\r
intro:\r
  direction: pydantic소개에서 입력 스키마를 정의하고 검증된 데이터만 처리 흐름에 넘김합니다.\r
  benefits:\r
  - 첫 실행 셀은 assert로 핵심 결과를 고정해 실습 코드가 깨지지 않았는지 확인합니다.\r
  - 외부 입력 확인 후 스키마 검증에 맞는 코드 입력을 고릅니다.\r
  - pydantic소개 결과를 성공 모델과 오류 메시지 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 API/자동화 입력 계약에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 주문 입력 계약과 배치 검증 입력 확인\r
      detail: 입력 기준(외부 입력)과 필요한 조건을 먼저 고정합니다.\r
    - label: 스키마 검증 처리 실행\r
      detail: 스키마 검증 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 성공 모델과 오류 메시지 결과 검증\r
      detail: 성공 모델과 오류 메시지 기준으로 실행 결과를 비교합니다.\r
    - label: pydantic소개 재사용\r
      detail: 완성 코드를 API/자동화 입력 계약에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 데이터 계약 환경\r
      detail: pydantic 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: pydantic소개 실행\r
      detail: 셀을 실행해 성공 모델과 오류 메시지와 예외 상태를 확인합니다.\r
    - label: pydantic소개 완료\r
      detail: 검증된 코드를 API/자동화 입력 계약로 남깁니다.\r
sections:\r
- id: intro\r
  blocks:\r
  - type: mainHeader\r
    emoji: ✅\r
    title: Pydantic??\r
    subtitle: Python 데이터 검증의 대표 외부 패키지
  - type: hero\r
    emoji: 🛡️\r
    title: 타입 힌트 기반 데이터 검증\r
    subtitle: 런타임에서 데이터를 안전하게 검증하고 변환\r
    points:\r
    - emoji: ✅\r
      title: 자동 검증\r
    - emoji: 🔄\r
      title: 타입 변환\r
    - emoji: 📦\r
      title: 직렬화\r
    - emoji: ⚙️\r
      title: 설정 관리\r
  goal: Pydantic??에서 외부 입력을 바꿨을 때 성공 모델과 오류 메시지가 어떻게 달라지는지 확인한다.\r
  why: 데이터 계약은 외부 입력을 안전하게 처리하고 오류를 빠르게 드러내는 실무 기준입니다.\r
- id: what_is_pydantic\r
  blocks:\r
  - type: sectionHeader\r
    title: 🤔 Pydantic이 뭔가요?\r
    subtitle: 데이터 검증과 파싱의 혁명\r
  - type: note\r
    style: info\r
    title: 왜 데이터 검증이 필요한가?\r
    content: 외부에서 들어오는 데이터는 신뢰할 수 없습니다. API 요청, JSON 파일, 사용자 입력 등은 예상과 다른 형태일 수 있습니다. 직접 검증 코드를 작성하면 반복적이고\r
      오류가 발생하기 쉽습니다. Pydantic은 Python 타입 힌트를 사용하여 데이터 구조를 정의하고, 런타임에 자동으로 검증합니다. 잘못된 데이터가 들어오면 명확한 에러\r
      메시지를 제공합니다.\r
  - type: featureCards\r
    cards:\r
    - emoji: 📝\r
      title: 선언적 모델 정의\r
      description: 타입 힌트로 데이터 구조 선언\r
    - emoji: ✅\r
      title: 자동 검증\r
      description: 타입, 범위, 형식 자동 검사\r
    - emoji: 🔄\r
      title: 타입 강제 변환\r
      description: 문자열 → 숫자 자동 변환\r
    - emoji: 📤\r
      title: 직렬화/역직렬화\r
      description: JSON, dict 변환 지원\r
  goal: 🤔 Pydantic이 뭔가요?에서 외부 입력을 바꿨을 때 성공 모델과 오류 메시지가 어떻게 달라지는지 확인한다.\r
  why: 데이터 계약은 외부 입력을 안전하게 처리하고 오류를 빠르게 드러내는 실무 기준입니다.\r
- id: why_pydantic\r
  blocks:\r
  - type: sectionHeader\r
    title: 🌟 왜 Pydantic이 필요한가요?\r
    subtitle: 수동 검증 vs Pydantic\r
  - type: note\r
    style: info\r
    title: 수동 검증의 문제점\r
    content: 수동으로 데이터를 검증하면 코드가 장황해집니다. if문, isinstance, try-except가 반복됩니다. 검증 로직이 비즈니스 로직과 섞여 가독성이 떨어집니다.\r
      새 필드가 추가되면 검증 코드도 수정해야 합니다. Pydantic은 이 모든 것을 자동화합니다. 모델을 정의하면 검증, 변환, 에러 메시지가 모두 처리됩니다.\r
  - type: featureCards\r
    cards:\r
    - emoji: ⚡\r
      title: 개발 속도 향상\r
      description: 검증 코드 자동 생성\r
    - emoji: 🐛\r
      title: 버그 감소\r
      description: 타입 오류 조기 발견\r
    - emoji: 📖\r
      title: 문서화 효과\r
      description: 모델이 곧 API 명세\r
    - emoji: 🔧\r
      title: IDE 지원\r
      description: 자동완성, 타입 체크\r
  goal: 🌟 왜 Pydantic이 필요한가요?에서 외부 입력을 바꿨을 때 성공 모델과 오류 메시지가 어떻게 달라지는지 확인한다.\r
  why: 데이터 계약은 외부 입력을 안전하게 처리하고 오류를 빠르게 드러내는 실무 기준입니다.\r
- id: pydantic_vs_others\r
  blocks:\r
  - type: sectionHeader\r
    title: 🆚 Pydantic vs 다른 도구\r
    subtitle: 언제 무엇을 쓸까?\r
  - type: compare\r
    left:\r
      title: dataclasses\r
      subtitle: 표준 라이브러리\r
      icon: 📦\r
      color: blue\r
      items:\r
      - 데이터 클래스 정의\r
      - 기본값, frozen 지원\r
      - 검증 기능 없음\r
      - 직렬화 제한적\r
      infoBox: 단순 데이터 컨테이너용\r
    right:\r
      title: Pydantic\r
      subtitle: 검증 + 직렬화\r
      icon: ✅\r
      color: green\r
      items:\r
      - 데이터 클래스 + 검증\r
      - 타입 강제 변환\r
      - 상세한 에러 메시지\r
      - JSON/dict 직렬화\r
      infoBox: 외부 데이터 처리용\r
  - type: compare\r
    left:\r
      title: attrs\r
      subtitle: 고급 클래스 도구\r
      icon: 🔧\r
      color: purple\r
      items:\r
      - 유연한 클래스 정의\r
      - 검증자 수동 정의\r
      - 성능 최적화\r
      - 학습 곡선 있음\r
      infoBox: 고도로 커스텀된 클래스용\r
    right:\r
      title: Pydantic\r
      subtitle: 간편한 검증\r
      icon: ✅\r
      color: green\r
      items:\r
      - 타입 힌트 기반 자동 검증\r
      - FastAPI 네이티브 지원\r
      - JSON Schema 생성\r
      - 배우기 쉬움\r
      infoBox: API 개발, 설정 관리용\r
  - type: note\r
    style: tip\r
    title: 선택 가이드\r
    content: 단순 데이터 컨테이너만 필요하면 dataclasses를 사용하세요. 외부 데이터(API 요청, JSON, 설정 파일)를 다루면 Pydantic이 적합합니다. FastAPI를\r
      사용한다면 Pydantic은 필수입니다. 복잡한 클래스 계층이 필요하면 attrs도 고려하세요.\r
  goal: 🆚 Pydantic vs 다른 도구에서 외부 입력을 바꿨을 때 성공 모델과 오류 메시지가 어떻게 달라지는지 확인한다.\r
  why: 데이터 계약은 외부 입력을 안전하게 처리하고 오류를 빠르게 드러내는 실무 기준입니다.\r
- id: core_concepts\r
  blocks:\r
  - type: sectionHeader\r
    title: 🧩 핵심 개념\r
    subtitle: Pydantic으로 무엇을 할 수 있나요?\r
  - type: featureCards\r
    cards:\r
    - emoji: 1️⃣\r
      title: BaseModel\r
      description: 데이터 모델 정의의 기본 클래스\r
    - emoji: 2️⃣\r
      title: Field\r
      description: 필드별 제약조건, 기본값 설정\r
    - emoji: 3️⃣\r
      title: Validator\r
      description: 커스텀 검증 로직 추가\r
    - emoji: 4️⃣\r
      title: 중첩 모델\r
      description: 복잡한 데이터 구조 표현\r
    - emoji: 5️⃣\r
      title: 직렬화\r
      description: model_dump(), model_dump_json()\r
    - emoji: 6️⃣\r
      title: 설정 관리\r
      description: 환경변수 기반 설정\r
  goal: 🧩 핵심 개념에서 외부 입력을 바꿨을 때 성공 모델과 오류 메시지가 어떻게 달라지는지 확인한다.\r
  why: 데이터 계약은 외부 입력을 안전하게 처리하고 오류를 빠르게 드러내는 실무 기준입니다.\r
- id: basic_example\r
  blocks:\r
  - type: sectionHeader\r
    title: 💡 간단한 예시\r
    subtitle: Pydantic 맛보기\r
  - type: note\r
    style: info\r
    title: 사용자 모델 정의\r
    content: Pydantic 모델은 BaseModel을 상속하고 타입 힌트로 필드를 정의합니다. 인스턴스 생성 시 자동으로 타입을 검증하고 변환합니다. 잘못된 데이터가 들어오면\r
      ValidationError가 발생합니다.\r
  - type: note\r
    style: tip\r
    title: 코드 예시\r
    content: 'class User(BaseModel): name: str, age: int, email: str 형태로 정의하면, User(name="Alice", age="25",\r
      email="a@b.com") 호출 시 age가 문자열 "25"여도 자동으로 정수 25로 변환됩니다. age에 "invalid"를 넣으면 ValidationError가 발생합니다.'\r
  goal: 💡 간단한 예시에서 외부 입력을 바꿨을 때 성공 모델과 오류 메시지가 어떻게 달라지는지 확인한다.\r
  why: 데이터 계약은 외부 입력을 안전하게 처리하고 오류를 빠르게 드러내는 실무 기준입니다.\r
- id: use_cases\r
  blocks:\r
  - type: sectionHeader\r
    title: 💼 실전 활용 사례\r
    subtitle: Pydantic으로 해결하는 문제들\r
  - type: featureCards\r
    cards:\r
    - emoji: 🌐\r
      title: API 요청/응답\r
      description: FastAPI와 함께 API 스키마 정의\r
    - emoji: 📄\r
      title: JSON 파싱\r
      description: 외부 JSON 데이터 검증 및 변환\r
    - emoji: ⚙️\r
      title: 설정 관리\r
      description: 환경변수, 설정 파일 로딩\r
    - emoji: 🗄️\r
      title: ORM 통합\r
      description: SQLAlchemy 모델과 연동\r
    - emoji: 📊\r
      title: 데이터 파이프라인\r
      description: ETL 과정의 데이터 검증\r
    - emoji: 🧪\r
      title: 테스트 데이터\r
      description: 일관된 테스트 픽스처 생성\r
  goal: 💼 실전 활용 사례에서 외부 입력을 바꿨을 때 성공 모델과 오류 메시지가 어떻게 달라지는지 확인한다.\r
  why: 데이터 계약은 외부 입력을 안전하게 처리하고 오류를 빠르게 드러내는 실무 기준입니다.\r
- id: projects_preview\r
  blocks:\r
  - type: sectionHeader\r
    title: 🗺️ 앞으로 배울 내용\r
    subtitle: 10개 프로젝트로 마스터하기\r
  - type: table\r
    headers:\r
    - 단계\r
    - 프로젝트\r
    - 배울 내용\r
    - 실용 가치\r
    rows:\r
    - - 입문\r
      - 사용자 모델 만들기\r
      - BaseModel, 타입 힌트, 검증\r
      - 기본 데이터 구조\r
    - - 입문\r
      - 필드 제약조건\r
      - Field, 범위, 정규표현식\r
      - 상세 검증 규칙\r
    - - 기초\r
      - 중첩 모델\r
      - List, Dict, 모델 중첩\r
      - 복잡한 데이터\r
    - - 기초\r
      - 커스텀 검증\r
      - validator, field_validator\r
      - 비즈니스 로직\r
    - - 기초\r
      - 직렬화 마스터\r
      - model_dump, alias, exclude\r
      - API 응답\r
    - - 중급\r
      - 설정 관리\r
      - BaseSettings, 환경변수\r
      - 앱 설정\r
    - - 중급\r
      - JSON Schema\r
      - 스키마 생성, 문서화\r
      - API 문서\r
    - - 중급\r
      - 상속과 Generic\r
      - 모델 상속, 재사용\r
      - DRY 원칙\r
    - - 심화\r
      - 고급 타입\r
      - Union, Literal, Annotated\r
      - 정밀한 타입\r
    - - 심화\r
      - 종합 프로젝트\r
      - 전체 API 모델 설계\r
      - 실전 활용\r
  - type: note\r
    style: info\r
    title: 프로젝트 기반 학습\r
    content: 각 프로젝트는 실제 시나리오를 다룹니다. 사용자 등록 폼 검증, API 응답 모델링, 설정 파일 관리 등 현실적인 문제를 해결합니다. 10개 프로젝트를 완료하면\r
      Pydantic을 활용한 견고한 데이터 모델을 설계할 수 있습니다.\r
  goal: 🗺️ 앞으로 배울 내용에서 외부 입력을 바꿨을 때 성공 모델과 오류 메시지가 어떻게 달라지는지 확인한다.\r
  why: 데이터 계약은 외부 입력을 안전하게 처리하고 오류를 빠르게 드러내는 실무 기준입니다.\r
- id: local_runtime_note\r
  blocks:\r
  - type: sectionHeader\r
    title: ⚠️ Codaro 로컬 Python 환경 참고사항\r
    subtitle: 로컬 실행 시 확인할 점\r
  - type: note\r
    style: warning\r
    title: 제한사항\r
    content: Pydantic V2는 Codaro 로컬 Python에서 실행됩니다. 모델 검증, 설정 파일, 환경변수 실습을 로컬 파일 시스템 기준으로 다룰 수 있습니다.\r
  - type: featureCards\r
    cards:\r
    - emoji: ✅\r
      title: 정상 작동\r
      description: BaseModel, Field, validator, 직렬화\r
    - emoji: ⚠️\r
      title: 제한 가능\r
      description: 파일 시스템 기반 설정 로딩\r
    - emoji: 📦
      title: 로컬 준비
      description: 라이브러리 패널에서 현재 실행 환경 준비
  goal: ⚠️ Codaro 로컬 Python 환경 참고사항에서 외부 입력을 바꿨을 때 성공 모델과 오류 메시지가 어떻게 달라지는지 확인한다.\r
  why: 데이터 계약은 외부 입력을 안전하게 처리하고 오류를 빠르게 드러내는 실무 기준입니다.\r
- id: package_ready
  blocks:\r
  - type: sectionHeader\r
    title: 📦 준비 확인과 시작
    subtitle: Codaro 로컬 Python 환경에서 바로 사용\r
  - type: note\r
    style: info\r
    title: 로컬에서 바로 실행\r
    content: 이 강의는 Codaro 로컬 Python 환경에서 실행됩니다. 필요한 패키지는 상단 라이브러리 패널이 현재 실행 환경에 준비하고, 레슨 안에서는 import와 작은 객체 생성으로 동작을 확인합니다.
  - type: featureCards\r
    cards:\r
    - emoji: 🌐\r
      title: Codaro 로컬 Python 환경\r
      description: 로컬 Python 실행\r
    - emoji: 📦
      title: 패키지 준비
      description: 라이브러리 패널 기준
    - emoji: 🚀\r
      title: 바로 시작\r
      description: from pydantic import BaseModel\r
  goal: 📦 준비 확인과 시작에서 외부 입력을 바꿨을 때 성공 모델과 오류 메시지가 어떻게 달라지는지 확인한다.
  why: 데이터 계약은 외부 입력을 안전하게 처리하고 오류를 빠르게 드러내는 실무 기준입니다.\r
- id: resources\r
  blocks:\r
  - type: sectionHeader\r
    title: 📚 참고 자료\r
    subtitle: 더 깊이 공부하고 싶다면\r
  - type: links\r
    items:\r
    - text: Pydantic 공식 문서\r
      url: https://docs.pydantic.dev/\r
      icon: 🔗\r
    - text: Pydantic V2 Migration Guide\r
      url: https://docs.pydantic.dev/latest/migration/\r
      icon: 🔗\r
    - text: Pydantic GitHub\r
      url: https://github.com/pydantic/pydantic\r
      icon: 🔗\r
  goal: 📚 참고 자료에서 외부 입력을 바꿨을 때 성공 모델과 오류 메시지가 어떻게 달라지는지 확인한다.\r
  why: 데이터 계약은 외부 입력을 안전하게 처리하고 오류를 빠르게 드러내는 실무 기준입니다.\r
- id: next\r
  blocks:\r
  - type: hero\r
    emoji: 👉\r
    title: '다음: 사용자 모델 만들기'\r
    subtitle: BaseModel로 첫 번째 데이터 모델을 정의합니다\r
  goal: '다음: 사용자 모델 만들기에서 외부 입력을 바꿨을 때 성공 모델과 오류 메시지가 어떻게 달라지는지 확인한다.'\r
  why: 데이터 계약은 외부 입력을 안전하게 처리하고 오류를 빠르게 드러내는 실무 기준입니다.\r
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