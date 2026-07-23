var e=`meta:\r
  packages:\r
  - pydantic\r
  id: pydantic_10\r
  title: 종합데이터파이프라인\r
  order: 10\r
  category: pydantic\r
  difficulty: ⭐⭐⭐⭐⭐\r
  badge: 심화\r
  tags:\r
  - pydantic\r
  - 데이터파이프라인\r
  - ETL\r
  - 검증\r
  - 변환\r
  seo:\r
    title: Pydantic 종합 프로젝트 - 데이터 파이프라인 구축\r
    description: Pydantic으로 완전한 데이터 파이프라인을 구축합니다. ETL, 검증, 변환, 보고서 생성을 배웁니다.\r
    keywords:\r
    - pydantic\r
    - 데이터파이프라인\r
    - ETL\r
    - 프로젝트\r
intro:\r
  emoji: 🚀\r
  goal: Pydantic으로 완전한 데이터 처리 파이프라인을 구축합니다.\r
  description: 데이터 수집, 검증, 변환, 집계, 보고서 생성까지 전체 ETL 과정을 Pydantic 모델로 구현합니다.\r
  direction: 종합데이터파이프라인에서 입력 스키마를 정의하고 검증된 데이터만 처리 흐름에 넘김합니다.\r
  benefits:\r
  - 외부 입력 확인 후 스키마 검증에 맞는 코드 입력을 고릅니다.\r
  - 종합데이터파이프라인 결과를 성공 모델과 오류 메시지 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 API/자동화 입력 계약에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 환경 설정 입력 확인\r
      detail: 입력 기준(외부 입력)과 필요한 조건을 먼저 고정합니다.\r
    - label: 소스 데이터 모델 처리 실행\r
      detail: 스키마 검증 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 검증 모델 결과 검증\r
      detail: 성공 모델과 오류 메시지 기준으로 실행 결과를 비교합니다.\r
    - label: 종합데이터파이프라인 재사용\r
      detail: 완성 코드를 API/자동화 입력 계약에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 데이터 계약 환경\r
      detail: pydantic 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 종합데이터파이프라인 실행\r
      detail: 셀을 실행해 성공 모델과 오류 메시지와 예외 상태를 확인합니다.\r
    - label: 종합데이터파이프라인 완료\r
      detail: 검증된 코드를 API/자동화 입력 계약로 남깁니다.\r
project:\r
  name: 전자상거래 거래 분석 파이프라인\r
  scenario: 매일 수만 건의 거래 데이터가 다양한 형식으로 유입됩니다. 원본 데이터를 검증하고, 분석 가능한 형태로 변환한 뒤, 일별/사용자별 통계와 품질 리포트를 자동 생성하는\r
    ETL 파이프라인을 구축합니다.\r
sections:\r
- id: load\r
  title: 환경 설정\r
  structuredPrimary: true\r
  subtitle: 패키지 로드\r
  goal: 환경 설정에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: import 준비가 정확해야 다음 셀과 자동화 코드에서 같은 이름을 안정적으로 재사용할 수 있습니다.\r
  explanation: 데이터 파이프라인에 필요한 pydantic과 보조 모듈을 로드합니다. ETL 파이프라인은 Extract(추출), Transform(변환), Load(적재)의\r
    세 단계로 구성되며, Pydantic은 각 단계에서 데이터 구조와 유효성을 보장하는 핵심 역할을 담당합니다. 특히 외부 시스템에서 들어오는 비정형 데이터를 정형화하고, 변환 과정의\r
    타입 안전성을 확보하는 데 Pydantic의 강점이 발휘됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: import pydantic\r
  exercise:\r
    prompt: 환경 설정 예제에서 import한 모듈의 별칭이나 바로 이어지는 확인 호출을 바꿔 준비 상태를 확인하세요.\r
    starterCode: import pydantic\r
    hints:\r
    - 바꿀 지점은 외부 입력을 만드는 첫 줄과 스키마 검증 줄에서 찾으세요.\r
    - 실행 뒤 성공 모델과 오류 메시지 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 환경 설정의 import 대상 모듈과 별칭이 현재 로컬 환경에서 준비되어야 합니다.\r
    resultCheck: 환경 설정 실행 결과가 성공 모델과 오류 메시지 기준으로 바꾼 입력값을 반영해야 합니다.\r
- id: source\r
  title: 소스 데이터 모델\r
  structuredPrimary: true\r
  subtitle: 원본 구조 정의\r
  goal: 소스 데이터 모델에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 외부 시스템에서 수집되는 원본 데이터의 구조를 정의합니다. 원본 데이터는 타입이 모두 문자열이거나 불확실한 경우가 많으므로, 먼저 느슨한 모델로 수신한 뒤\r
    검증 단계에서 정확한 타입으로 변환합니다. 이 패턴은 실무에서 CSV, JSON API, 레거시 시스템 등 다양한 소스를 다룰 때 필수적입니다. RawTransaction은 거래\r
    데이터, RawUserEvent는 사용자 행동 로그를 담는 모델입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    from pydantic import BaseModel, Field\r
    from typing import Optional\r
    from datetime import datetime, date\r
    from enum import Enum\r
\r
    class RawTransaction(BaseModel):\r
        transactionId: str\r
        userId: str\r
        productId: str\r
        amount: str\r
        currency: str\r
        timestamp: str\r
        status: str\r
        metadata: Optional[dict] = None\r
\r
    class RawUserEvent(BaseModel):\r
        eventId: str\r
        userId: str\r
        eventType: str\r
        eventData: dict\r
        occurredAt: str\r
        deviceInfo: Optional[dict] = None\r
\r
    rawTx = RawTransaction(\r
        transactionId="TX001",\r
        userId="U100",\r
        productId="P001",\r
        amount="15000.50",\r
        currency="KRW",\r
        timestamp="2024-03-15 10:30:00",\r
        status="completed"\r
    )\r
    rawTx\r
  exercise:\r
    prompt: 소스 데이터 모델 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      from pydantic import BaseModel, Field\r
      from typing import Optional\r
      from datetime import datetime, date\r
      from enum import Enum\r
\r
      class RawTransaction(BaseModel):\r
          transactionId: str\r
          userId: str\r
          productId: str\r
          amount: str\r
          currency: str\r
          timestamp: str\r
          status: str\r
          metadata: Optional[dict] = None\r
\r
      class RawUserEvent(BaseModel):\r
          eventId: str\r
          userId: str\r
          eventType: str\r
          eventData: dict\r
          occurredAt: str\r
          deviceInfo: Optional[dict] = None\r
\r
      rawTx = RawTransaction(\r
          transactionId="TX001",\r
          userId="U100",\r
          productId="P001",\r
          amount="15000.50",\r
          currency="KRW",\r
          timestamp="2024-03-15 10:30:00",\r
          status="completed"\r
      )\r
      rawTx\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 소스 데이터 모델에서 \`rawTx\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 소스 데이터 모델 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: validated\r
  title: 검증 모델\r
  structuredPrimary: true\r
  subtitle: 타입 변환과 검증\r
  goal: 검증 모델에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: 원본 데이터를 검증하고 올바른 타입으로 변환하는 모델입니다. field_validator의 mode='before'를 사용해 입력값이 모델에 할당되기 전에\r
    전처리합니다. 금액은 쉼표가 포함된 문자열일 수 있고, 날짜는 다양한 포맷으로 들어올 수 있으므로 유연하게 파싱합니다. TransactionStatus Enum으로 상태값을 제한하면\r
    잘못된 상태가 시스템에 유입되는 것을 원천 차단할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    from pydantic import field_validator\r
    from typing import Literal\r
\r
    class TransactionStatus(str, Enum):\r
        PENDING = "pending"\r
        COMPLETED = "completed"\r
        FAILED = "failed"\r
        REFUNDED = "refunded"\r
\r
    class ValidatedTransaction(BaseModel):\r
        transactionId: str = Field(min_length=1)\r
        userId: str = Field(min_length=1)\r
        productId: str = Field(min_length=1)\r
        amount: float = Field(gt=0)\r
        currency: Literal["KRW", "USD", "EUR"] = "KRW"\r
        timestamp: datetime\r
        status: TransactionStatus\r
        metadata: dict = Field(default_factory=dict)\r
\r
        @field_validator('amount', mode='before')\r
        @classmethod\r
        def parseAmount(cls, v):\r
            if isinstance(v, str):\r
                return float(v.replace(",", ""))\r
            return v\r
\r
        @field_validator('timestamp', mode='before')\r
        @classmethod\r
        def parseTimestamp(cls, v):\r
            if isinstance(v, str):\r
                formats = ["%Y-%m-%d %H:%M:%S", "%Y-%m-%dT%H:%M:%S", "%Y/%m/%d %H:%M:%S"]\r
                for fmt in formats:\r
                    try:\r
                        return datetime.strptime(v, fmt)\r
                    except ValueError:\r
                        continue\r
            return v\r
\r
    validated = ValidatedTransaction(\r
        transactionId=rawTx.transactionId,\r
        userId=rawTx.userId,\r
        productId=rawTx.productId,\r
        amount=rawTx.amount,\r
        currency=rawTx.currency,\r
        timestamp=rawTx.timestamp,\r
        status=rawTx.status\r
    )\r
    validated\r
  exercise:\r
    prompt: 검증 모델 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      from pydantic import field_validator\r
      from typing import Literal\r
\r
      class TransactionStatus(str, Enum):\r
          PENDING = "pending"\r
          COMPLETED = "completed"\r
          FAILED = "failed"\r
          REFUNDED = "refunded"\r
\r
      class ValidatedTransaction(BaseModel):\r
          transactionId: str = Field(min_length=1)\r
          userId: str = Field(min_length=1)\r
          productId: str = Field(min_length=1)\r
          amount: float = Field(gt=0)\r
          currency: Literal["KRW", "USD", "EUR"] = "KRW"\r
          timestamp: datetime\r
          status: TransactionStatus\r
          metadata: dict = Field(default_factory=dict)\r
\r
          @field_validator('amount', mode='before')\r
          @classmethod\r
          def parseAmount(cls, v):\r
              if isinstance(v, str):\r
                  return float(v.replace(",", ""))\r
              return v\r
\r
          @field_validator('timestamp', mode='before')\r
          @classmethod\r
          def parseTimestamp(cls, v):\r
              if isinstance(v, str):\r
                  formats = ["%Y-%m-%d %H:%M:%S", "%Y-%m-%dT%H:%M:%S", "%Y/%m/%d %H:%M:%S"]\r
                  for fmt in formats:\r
                      try:\r
                          return datetime.strptime(v, fmt)\r
                      except ValueError:\r
                          continue\r
              return v\r
\r
      validated = ValidatedTransaction(\r
          transactionId=rawTx.transactionId,\r
          userId=rawTx.userId,\r
          productId=rawTx.productId,\r
          amount=rawTx.amount,\r
          currency=rawTx.currency,\r
          timestamp=rawTx.timestamp,\r
          status=rawTx.status\r
      )\r
      validated\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 검증 모델의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 검증 모델 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: enriched\r
  title: 데이터 변환\r
  structuredPrimary: true\r
  subtitle: ETL Transform\r
  goal: 데이터 변환에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: 검증된 데이터를 분석에 적합한 형태로 변환합니다. 원본 통화를 KRW로 환산하고, 날짜에서 요일과 시간대 정보를 추출하며, 성공 여부를 불리언으로 표현합니다.\r
    fromValidated 클래스 메서드 패턴을 사용하면 변환 로직을 모델 내부에 캡슐화하여 재사용성을 높일 수 있습니다. 이렇게 풍부해진 데이터는 일별 매출 분석, 요일별 패턴\r
    분석, 주말/평일 비교 등 다양한 분석에 활용됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    class EnrichedTransaction(BaseModel):\r
        transactionId: str\r
        userId: str\r
        productId: str\r
        amountKRW: float\r
        originalCurrency: str\r
        originalAmount: float\r
        transactionDate: date\r
        transactionHour: int\r
        dayOfWeek: int\r
        isWeekend: bool\r
        status: TransactionStatus\r
        isSuccessful: bool\r
\r
        @classmethod\r
        def fromValidated(cls, tx: ValidatedTransaction) -> "EnrichedTransaction":\r
            exchangeRates = {"KRW": 1, "USD": 1300, "EUR": 1400}\r
            rate = exchangeRates.get(tx.currency, 1)\r
\r
            return cls(\r
                transactionId=tx.transactionId,\r
                userId=tx.userId,\r
                productId=tx.productId,\r
                amountKRW=tx.amount * rate,\r
                originalCurrency=tx.currency,\r
                originalAmount=tx.amount,\r
                transactionDate=tx.timestamp.date(),\r
                transactionHour=tx.timestamp.hour,\r
                dayOfWeek=tx.timestamp.weekday(),\r
                isWeekend=tx.timestamp.weekday() >= 5,\r
                status=tx.status,\r
                isSuccessful=tx.status == TransactionStatus.COMPLETED\r
            )\r
\r
    enriched = EnrichedTransaction.fromValidated(validated)\r
    enriched\r
  exercise:\r
    prompt: 데이터 변환 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      class EnrichedTransaction(BaseModel):\r
          transactionId: str\r
          userId: str\r
          productId: str\r
          amountKRW: float\r
          originalCurrency: str\r
          originalAmount: float\r
          transactionDate: date\r
          transactionHour: int\r
          dayOfWeek: int\r
          isWeekend: bool\r
          status: TransactionStatus\r
          isSuccessful: bool\r
\r
          @classmethod\r
          def fromValidated(cls, tx: ValidatedTransaction) -> "EnrichedTransaction":\r
              exchangeRates = {"KRW": 1, "USD": 1300, "EUR": 1400}\r
              rate = exchangeRates.get(tx.currency, 1)\r
\r
              return cls(\r
                  transactionId=tx.transactionId,\r
                  userId=tx.userId,\r
                  productId=tx.productId,\r
                  amountKRW=tx.amount * rate,\r
                  originalCurrency=tx.currency,\r
                  originalAmount=tx.amount,\r
                  transactionDate=tx.timestamp.date(),\r
                  transactionHour=tx.timestamp.hour,\r
                  dayOfWeek=tx.timestamp.weekday(),\r
                  isWeekend=tx.timestamp.weekday() >= 5,\r
                  status=tx.status,\r
                  isSuccessful=tx.status == TransactionStatus.COMPLETED\r
              )\r
\r
      enriched = EnrichedTransaction.fromValidated(validated)\r
      enriched\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    noError: 데이터 변환의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 데이터 변환 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: aggregate\r
  title: 집계 모델\r
  structuredPrimary: true\r
  subtitle: 통계 계산\r
  goal: 집계 모델에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: 변환된 데이터를 집계하여 일별, 사용자별 통계를 생성합니다. DailySummary는 하루 동안의 거래 현황을 요약하고, UserSummary는 고객별 구매\r
    패턴을 분석합니다. computed_field를 사용해 성공률이나 고객 생애 일수 같은 파생 지표를 자동 계산하면, 지표 산출 로직이 모델에 응집되어 일관성을 유지할 수 있습니다.\r
    이런 집계 모델은 대시보드나 리포트의 기반 데이터가 됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    from pydantic import computed_field\r
\r
    class DailySummary(BaseModel):\r
        summaryDate: date\r
        totalTransactions: int\r
        successfulTransactions: int\r
        failedTransactions: int\r
        totalAmountKRW: float\r
        averageAmountKRW: float\r
        uniqueUsers: int\r
        uniqueProducts: int\r
\r
        @computed_field\r
        @property\r
        def successRate(self) -> float:\r
            if self.totalTransactions == 0:\r
                return 0.0\r
            return round(self.successfulTransactions / self.totalTransactions * 100, 2)\r
\r
    class UserSummary(BaseModel):\r
        userId: str\r
        totalTransactions: int\r
        totalSpentKRW: float\r
        averageOrderKRW: float\r
        firstTransactionDate: date\r
        lastTransactionDate: date\r
        favoriteProductId: Optional[str] = None\r
\r
        @computed_field\r
        @property\r
        def customerLifetimeDays(self) -> int:\r
            return (self.lastTransactionDate - self.firstTransactionDate).days\r
  exercise:\r
    prompt: 집계 모델 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      from pydantic import computed_field\r
\r
      class DailySummary(BaseModel):\r
          summaryDate: date\r
          totalTransactions: int\r
          successfulTransactions: int\r
          failedTransactions: int\r
          totalAmountKRW: float\r
          averageAmountKRW: float\r
          uniqueUsers: int\r
          uniqueProducts: int\r
\r
          @computed_field\r
          @property\r
          def successRate(self) -> float:\r
              if self.totalTransactions == 0:\r
                  return 0.0\r
              return round(self.successfulTransactions / self.totalTransactions * 100, 2)\r
\r
      class UserSummary(BaseModel):\r
          userId: str\r
          totalTransactions: int\r
          totalSpentKRW: float\r
          averageOrderKRW: float\r
          firstTransactionDate: date\r
          lastTransactionDate: date\r
          favoriteProductId: Optional[str] = None\r
\r
          @computed_field\r
          @property\r
          def customerLifetimeDays(self) -> int:\r
              return (self.lastTransactionDate - self.firstTransactionDate).days\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 집계 모델의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 집계 모델 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: pipeline\r
  title: 파이프라인 클래스\r
  structuredPrimary: true\r
  subtitle: ETL 구현\r
  goal: 파이프라인 클래스에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: 데이터 수집부터 집계까지 전체 파이프라인을 클래스로 구현합니다. DataPipeline 클래스는 extract와 transform 메서드로 ETL의 E와 T를\r
    담당하며, 각 단계에서 발생한 오류를 별도로 수집합니다. 이 패턴은 파이프라인 실행 중 일부 레코드가 실패해도 나머지는 계속 처리할 수 있게 하고, 오류 분석을 위한 정보를 보존합니다.\r
    PipelineResult 모델로 처리 결과를 구조화하면 후속 모니터링과 알림 시스템 연동이 용이해집니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    from pydantic import ValidationError\r
\r
    class PipelineResult(BaseModel):\r
        processedCount: int\r
        successCount: int\r
        errorCount: int\r
        errors: list[dict] = []\r
        enrichedData: list[dict] = []\r
\r
    class DataPipeline:\r
        def __init__(self):\r
            self.rawData = []\r
            self.validatedData = []\r
            self.enrichedData = []\r
            self.errors = []\r
\r
        def extract(self, rawRecords: list[dict]) -> int:\r
            self.rawData = []\r
            for record in rawRecords:\r
                try:\r
                    raw = RawTransaction.model_validate(record)\r
                    self.rawData.append(raw)\r
                except ValidationError as e:\r
                    self.errors.append({"stage": "extract", "data": record, "error": str(e)})\r
            return len(self.rawData)\r
\r
        def transform(self) -> int:\r
            self.validatedData = []\r
            self.enrichedData = []\r
            for raw in self.rawData:\r
                try:\r
                    validatedItem = ValidatedTransaction(\r
                        transactionId=raw.transactionId,\r
                        userId=raw.userId,\r
                        productId=raw.productId,\r
                        amount=raw.amount,\r
                        currency=raw.currency,\r
                        timestamp=raw.timestamp,\r
                        status=raw.status,\r
                        metadata=raw.metadata or {}\r
                    )\r
                    self.validatedData.append(validatedItem)\r
                    enrichedItem = EnrichedTransaction.fromValidated(validatedItem)\r
                    self.enrichedData.append(enrichedItem)\r
                except ValidationError as e:\r
                    self.errors.append({"stage": "transform", "data": raw.model_dump(), "error": str(e)})\r
            return len(self.enrichedData)\r
\r
        def getResult(self) -> PipelineResult:\r
            return PipelineResult(\r
                processedCount=len(self.rawData),\r
                successCount=len(self.enrichedData),\r
                errorCount=len(self.errors),\r
                errors=self.errors,\r
                enrichedData=[e.model_dump() for e in self.enrichedData]\r
            )\r
\r
    pipeline = DataPipeline()\r
  exercise:\r
    prompt: 파이프라인 클래스 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      from pydantic import ValidationError\r
\r
      class PipelineResult(BaseModel):\r
          processedCount: int\r
          successCount: int\r
          errorCount: int\r
          errors: list[dict] = []\r
          enrichedData: list[dict] = []\r
\r
      class DataPipeline:\r
          def __init__(self):\r
              self.rawData = []\r
              self.validatedData = []\r
              self.enrichedData = []\r
              self.errors = []\r
\r
          def extract(self, rawRecords: list[dict]) -> int:\r
              self.rawData = []\r
              for record in rawRecords:\r
                  try:\r
                      raw = RawTransaction.model_validate(record)\r
                      self.rawData.append(raw)\r
                  except ValidationError as e:\r
                      self.errors.append({"stage": "extract", "data": record, "error": str(e)})\r
              return len(self.rawData)\r
\r
          def transform(self) -> int:\r
              self.validatedData = []\r
              self.enrichedData = []\r
              for raw in self.rawData:\r
                  try:\r
                      validatedItem = ValidatedTransaction(\r
                          transactionId=raw.transactionId,\r
                          userId=raw.userId,\r
                          productId=raw.productId,\r
                          amount=raw.amount,\r
                          currency=raw.currency,\r
                          timestamp=raw.timestamp,\r
                          status=raw.status,\r
                          metadata=raw.metadata or {}\r
                      )\r
                      self.validatedData.append(validatedItem)\r
                      enrichedItem = EnrichedTransaction.fromValidated(validatedItem)\r
                      self.enrichedData.append(enrichedItem)\r
                  except ValidationError as e:\r
                      self.errors.append({"stage": "transform", "data": raw.model_dump(), "error": str(e)})\r
              return len(self.enrichedData)\r
\r
          def getResult(self) -> PipelineResult:\r
              return PipelineResult(\r
                  processedCount=len(self.rawData),\r
                  successCount=len(self.enrichedData),\r
                  errorCount=len(self.errors),\r
                  errors=self.errors,\r
                  enrichedData=[e.model_dump() for e in self.enrichedData]\r
              )\r
\r
      pipeline = DataPipeline()\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 파이프라인 클래스의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 파이프라인 클래스 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: execute\r
  title: 파이프라인 실행\r
  structuredPrimary: true\r
  subtitle: 샘플 데이터 처리\r
  goal: 파이프라인 실행에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 샘플 거래 데이터로 파이프라인을 실행합니다. 테스트 데이터에는 정상 케이스와 함께 "invalid" 금액처럼 의도적으로 오류를 유발하는 데이터를 포함시켜 오류\r
    처리가 제대로 동작하는지 확인합니다. USD 거래는 환율 변환이 적용되고, pending/failed 상태는 isSuccessful이 false가 됩니다. 이렇게 다양한 시나리오를\r
    테스트하면 실제 운영 환경에서 발생할 수 있는 상황에 대비할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    sampleData = [\r
        {"transactionId": "TX001", "userId": "U100", "productId": "P001", "amount": "15000", "currency": "KRW", "timestamp": "2024-03-15 10:30:00", "status": "completed"},\r
        {"transactionId": "TX002", "userId": "U101", "productId": "P002", "amount": "25000.50", "currency": "KRW", "timestamp": "2024-03-15 11:00:00", "status": "completed"},\r
        {"transactionId": "TX003", "userId": "U100", "productId": "P003", "amount": "invalid", "currency": "KRW", "timestamp": "2024-03-15 12:00:00", "status": "completed"},\r
        {"transactionId": "TX004", "userId": "U102", "productId": "P001", "amount": "100", "currency": "USD", "timestamp": "2024-03-15 14:30:00", "status": "pending"},\r
        {"transactionId": "TX005", "userId": "U101", "productId": "P004", "amount": "50000", "currency": "KRW", "timestamp": "2024-03-15 15:00:00", "status": "failed"},\r
        {"transactionId": "TX006", "userId": "U103", "productId": "P002", "amount": "30000", "currency": "KRW", "timestamp": "2024-03-16 09:00:00", "status": "completed"}\r
    ]\r
\r
    extractedCount = pipeline.extract(sampleData)\r
    transformedCount = pipeline.transform()\r
    extractedCount, transformedCount\r
  exercise:\r
    prompt: 파이프라인 실행 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      sampleData = [\r
          {"transactionId": "TX001", "userId": "U100", "productId": "P001", "amount": "15000", "currency": "KRW", "timestamp": "2024-03-15 10:30:00", "status": "completed"},\r
          {"transactionId": "TX002", "userId": "U101", "productId": "P002", "amount": "25000.50", "currency": "KRW", "timestamp": "2024-03-15 11:00:00", "status": "completed"},\r
          {"transactionId": "TX003", "userId": "U100", "productId": "P003", "amount": "invalid", "currency": "KRW", "timestamp": "2024-03-15 12:00:00", "status": "completed"},\r
          {"transactionId": "TX004", "userId": "U102", "productId": "P001", "amount": "100", "currency": "USD", "timestamp": "2024-03-15 14:30:00", "status": "pending"},\r
          {"transactionId": "TX005", "userId": "U101", "productId": "P004", "amount": "50000", "currency": "KRW", "timestamp": "2024-03-15 15:00:00", "status": "failed"},\r
          {"transactionId": "TX006", "userId": "U103", "productId": "P002", "amount": "30000", "currency": "KRW", "timestamp": "2024-03-16 09:00:00", "status": "completed"}\r
      ]\r
\r
      extractedCount = pipeline.extract(sampleData)\r
      transformedCount = pipeline.transform()\r
      extractedCount, transformedCount\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 파이프라인 실행에서 \`sampleData\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 파이프라인 실행 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: aggregation\r
  title: 데이터 집계\r
  structuredPrimary: true\r
  subtitle: 통계 생성\r
  goal: 데이터 집계에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: 처리된 데이터를 집계하여 일별 통계를 생성합니다. aggregateDaily 함수는 거래를 날짜별로 그룹화한 뒤 각 그룹에 대해 DailySummary를 생성합니다.\r
    성공 거래 수, 총 거래액, 평균 거래액, 고유 사용자 수 등 핵심 지표를 계산합니다. 이 집계 결과는 경영진 대시보드, 일일 리포트, 이상 탐지 시스템 등에 활용됩니다. computed_field로\r
    정의한 successRate는 자동으로 계산되어 직렬화에 포함됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    from collections import defaultdict\r
\r
    def aggregateDaily(transactions: list[EnrichedTransaction]) -> list[DailySummary]:\r
        byDate = defaultdict(list)\r
        for tx in transactions:\r
            byDate[tx.transactionDate].append(tx)\r
\r
        summaries = []\r
        for txDate, txList in sorted(byDate.items()):\r
            successful = [tx for tx in txList if tx.isSuccessful]\r
            amounts = [tx.amountKRW for tx in txList]\r
            summaries.append(DailySummary(\r
                summaryDate=txDate,\r
                totalTransactions=len(txList),\r
                successfulTransactions=len(successful),\r
                failedTransactions=len(txList) - len(successful),\r
                totalAmountKRW=sum(amounts),\r
                averageAmountKRW=sum(amounts) / len(amounts) if amounts else 0,\r
                uniqueUsers=len(set(tx.userId for tx in txList)),\r
                uniqueProducts=len(set(tx.productId for tx in txList))\r
            ))\r
        return summaries\r
\r
    dailySummaries = aggregateDaily(pipeline.enrichedData)\r
    dailySummaries[0].model_dump() if dailySummaries else {}\r
  exercise:\r
    prompt: 데이터 집계 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      from collections import defaultdict\r
\r
      def aggregateDaily(transactions: list[EnrichedTransaction]) -> list[DailySummary]:\r
          byDate = defaultdict(list)\r
          for tx in transactions:\r
              byDate[tx.transactionDate].append(tx)\r
\r
          summaries = []\r
          for txDate, txList in sorted(byDate.items()):\r
              successful = [tx for tx in txList if tx.isSuccessful]\r
              amounts = [tx.amountKRW for tx in txList]\r
              summaries.append(DailySummary(\r
                  summaryDate=txDate,\r
                  totalTransactions=len(txList),\r
                  successfulTransactions=len(successful),\r
                  failedTransactions=len(txList) - len(successful),\r
                  totalAmountKRW=sum(amounts),\r
                  averageAmountKRW=sum(amounts) / len(amounts) if amounts else 0,\r
                  uniqueUsers=len(set(tx.userId for tx in txList)),\r
                  uniqueProducts=len(set(tx.productId for tx in txList))\r
              ))\r
          return summaries\r
\r
      dailySummaries = aggregateDaily(pipeline.enrichedData)\r
      dailySummaries[0].model_dump() if dailySummaries else {}\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 데이터 집계의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 데이터 집계 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: report\r
  title: 보고서 모델\r
  structuredPrimary: true\r
  subtitle: 종합 리포트\r
  goal: 보고서 모델에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: 집계 결과를 종합한 최종 보고서 모델을 정의합니다. PipelineReport는 파이프라인 실행 메타데이터, 일별 요약, 상위 상품/사용자 랭킹을 하나의 구조로\r
    통합합니다. generateReport 함수는 파이프라인과 집계 결과를 받아 리포트를 생성합니다. 리포트 ID에 타임스탬프를 포함시키면 버전 관리가 용이하고, periodDays\r
    computed_field로 분석 기간을 자동 계산합니다. 이 리포트는 JSON으로 직렬화되어 API 응답이나 파일 저장에 활용됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    class PipelineReport(BaseModel):\r
        reportId: str\r
        generatedAt: datetime\r
        periodStart: date\r
        periodEnd: date\r
        pipelineStats: dict\r
        dailySummaries: list[DailySummary]\r
        topProducts: list[dict]\r
        topUsers: list[dict]\r
\r
        @computed_field\r
        @property\r
        def periodDays(self) -> int:\r
            return (self.periodEnd - self.periodStart).days + 1\r
\r
    def generateReport(pipelineObj: DataPipeline, summaries: list[DailySummary]) -> PipelineReport:\r
        transactions = pipelineObj.enrichedData\r
\r
        productCounts = defaultdict(int)\r
        userSpending = defaultdict(float)\r
        for tx in transactions:\r
            productCounts[tx.productId] += 1\r
            userSpending[tx.userId] += tx.amountKRW\r
\r
        topProducts = [{"productId": k, "count": v} for k, v in sorted(productCounts.items(), key=lambda x: -x[1])[:5]]\r
        topUsers = [{"userId": k, "totalSpent": v} for k, v in sorted(userSpending.items(), key=lambda x: -x[1])[:5]]\r
\r
        dates = [tx.transactionDate for tx in transactions]\r
        return PipelineReport(\r
            reportId=f"RPT-{datetime.now().strftime('%Y%m%d%H%M%S')}",\r
            generatedAt=datetime.now(),\r
            periodStart=min(dates) if dates else date.today(),\r
            periodEnd=max(dates) if dates else date.today(),\r
            pipelineStats=pipelineObj.getResult().model_dump(exclude={"enrichedData"}),\r
            dailySummaries=summaries,\r
            topProducts=topProducts,\r
            topUsers=topUsers\r
        )\r
\r
    report = generateReport(pipeline, dailySummaries)\r
    report.model_dump(exclude={"dailySummaries"})\r
  exercise:\r
    prompt: 보고서 모델 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      class PipelineReport(BaseModel):\r
          reportId: str\r
          generatedAt: datetime\r
          periodStart: date\r
          periodEnd: date\r
          pipelineStats: dict\r
          dailySummaries: list[DailySummary]\r
          topProducts: list[dict]\r
          topUsers: list[dict]\r
\r
          @computed_field\r
          @property\r
          def periodDays(self) -> int:\r
              return (self.periodEnd - self.periodStart).days + 1\r
\r
      def generateReport(pipelineObj: DataPipeline, summaries: list[DailySummary]) -> PipelineReport:\r
          transactions = pipelineObj.enrichedData\r
\r
          productCounts = defaultdict(int)\r
          userSpending = defaultdict(float)\r
          for tx in transactions:\r
              productCounts[tx.productId] += 1\r
              userSpending[tx.userId] += tx.amountKRW\r
\r
          topProducts = [{"productId": k, "count": v} for k, v in sorted(productCounts.items(), key=lambda x: -x[1])[:5]]\r
          topUsers = [{"userId": k, "totalSpent": v} for k, v in sorted(userSpending.items(), key=lambda x: -x[1])[:5]]\r
\r
          dates = [tx.transactionDate for tx in transactions]\r
          return PipelineReport(\r
              reportId=f"RPT-{datetime.now().strftime('%Y%m%d%H%M%S')}",\r
              generatedAt=datetime.now(),\r
              periodStart=min(dates) if dates else date.today(),\r
              periodEnd=max(dates) if dates else date.today(),\r
              pipelineStats=pipelineObj.getResult().model_dump(exclude={"enrichedData"}),\r
              dailySummaries=summaries,\r
              topProducts=topProducts,\r
              topUsers=topUsers\r
          )\r
\r
      report = generateReport(pipeline, dailySummaries)\r
      report.model_dump(exclude={"dailySummaries"})\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    noError: 보고서 모델의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 보고서 모델 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: export\r
  title: 데이터 내보내기\r
  structuredPrimary: true\r
  subtitle: JSON/CSV 출력\r
  goal: 데이터 내보내기에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.\r
  explanation: 처리된 데이터와 보고서를 다양한 형식으로 내보냅니다. model_dump(mode='json')을 사용하면 datetime, date, Enum 등이 JSON\r
    호환 형식으로 자동 변환됩니다. CSV 형식은 스프레드시트나 BI 도구에서 활용하기 좋고, JSON은 API 응답이나 NoSQL 저장소에 적합합니다. toCsvRows 함수처럼\r
    필요한 필드만 선택적으로 추출하면 출력 용량을 줄이고 보안에 민감한 필드를 제외할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import json\r
\r
    exportJson = {\r
        "report": report.model_dump(mode='json'),\r
        "transactions": [tx.model_dump(mode='json') for tx in pipeline.enrichedData[:3]]\r
    }\r
    jsonOutput = json.dumps(exportJson, indent=2, ensure_ascii=False, default=str)\r
    jsonOutput[:500]\r
  exercise:\r
    prompt: 데이터 내보내기 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.\r
    starterCode: |-\r
      import json\r
\r
      exportJson = {\r
          "report": report.model_dump(mode='json'),\r
          "transactions": [tx.model_dump(mode='json') for tx in pipeline.enrichedData[:3]]\r
      }\r
      jsonOutput = json.dumps(exportJson, indent=2, ensure_ascii=False, default=str)\r
      jsonOutput[:500]\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 데이터 내보내기의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 데이터 내보내기 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: quality\r
  title: 품질 보고서\r
  structuredPrimary: true\r
  subtitle: 검증 통계\r
  goal: 품질 보고서에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: 데이터 품질 검증 결과를 상세히 보고합니다. DataQualityReport는 전체 레코드 중 유효한 레코드의 비율, 오류 유형별/단계별 분포, 샘플 오류\r
    메시지를 포함합니다. validationRate는 데이터 품질의 핵심 지표로, 이 값이 특정 임계치 이하로 떨어지면 소스 시스템에 문제가 있음을 의미합니다. 품질 보고서를 모니터링\r
    시스템과 연동하면 데이터 품질 저하를 조기에 탐지하고 대응할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    class DataQualityReport(BaseModel):\r
        totalRecords: int\r
        validRecords: int\r
        invalidRecords: int\r
        validationRate: float\r
        errorsByField: dict[str, int]\r
        errorsByType: dict[str, int]\r
        sampleErrors: list[dict]\r
\r
        @classmethod\r
        def fromPipeline(cls, pipelineObj: DataPipeline) -> "DataQualityReport":\r
            errorsByField = defaultdict(int)\r
            errorsByType = defaultdict(int)\r
\r
            for err in pipelineObj.errors:\r
                errorsByType[err.get("stage", "unknown")] += 1\r
                if "field" in err:\r
                    errorsByField[err["field"]] += 1\r
\r
            total = len(pipelineObj.rawData) + len(pipelineObj.errors)\r
            valid = len(pipelineObj.enrichedData)\r
\r
            return cls(\r
                totalRecords=total,\r
                validRecords=valid,\r
                invalidRecords=total - valid,\r
                validationRate=round(valid / total * 100, 2) if total > 0 else 0,\r
                errorsByField=dict(errorsByField),\r
                errorsByType=dict(errorsByType),\r
                sampleErrors=pipelineObj.errors[:5]\r
            )\r
\r
    qualityReport = DataQualityReport.fromPipeline(pipeline)\r
    qualityReport.model_dump(exclude={"sampleErrors"})\r
  exercise:\r
    prompt: 품질 보고서 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      class DataQualityReport(BaseModel):\r
          totalRecords: int\r
          validRecords: int\r
          invalidRecords: int\r
          validationRate: float\r
          errorsByField: dict[str, int]\r
          errorsByType: dict[str, int]\r
          sampleErrors: list[dict]\r
\r
          @classmethod\r
          def fromPipeline(cls, pipelineObj: DataPipeline) -> "DataQualityReport":\r
              errorsByField = defaultdict(int)\r
              errorsByType = defaultdict(int)\r
\r
              for err in pipelineObj.errors:\r
                  errorsByType[err.get("stage", "unknown")] += 1\r
                  if "field" in err:\r
                      errorsByField[err["field"]] += 1\r
\r
              total = len(pipelineObj.rawData) + len(pipelineObj.errors)\r
              valid = len(pipelineObj.enrichedData)\r
\r
              return cls(\r
                  totalRecords=total,\r
                  validRecords=valid,\r
                  invalidRecords=total - valid,\r
                  validationRate=round(valid / total * 100, 2) if total > 0 else 0,\r
                  errorsByField=dict(errorsByField),\r
                  errorsByType=dict(errorsByType),\r
                  sampleErrors=pipelineObj.errors[:5]\r
              )\r
\r
      qualityReport = DataQualityReport.fromPipeline(pipeline)\r
      qualityReport.model_dump(exclude={"sampleErrors"})\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 품질 보고서의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 품질 보고서 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: result\r
  title: 통합 파이프라인\r
  structuredPrimary: true\r
  subtitle: 전체 실행\r
  goal: 통합 파이프라인에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: 모든 구성 요소를 통합한 완성된 파이프라인입니다. CompletePipeline 클래스는 단일 run 메서드로 전체 ETL 과정과 집계, 리포트 생성을 수행합니다.\r
    반환값은 처리 상태, 요약 통계, 상세 리포트, 품질 보고서를 포함하는 딕셔너리입니다. 이 패턴은 배치 작업 스케줄러, API 엔드포인트, CLI 도구 등 다양한 실행 환경에서\r
    동일한 파이프라인 로직을 재사용할 수 있게 합니다. 실무에서는 여기에 로깅, 알림, 재시도 로직을 추가합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    class CompletePipeline:\r
        def __init__(self):\r
            self.pipelineInstance = DataPipeline()\r
\r
        def run(self, rawData: list[dict]) -> dict:\r
            self.pipelineInstance.extract(rawData)\r
            self.pipelineInstance.transform()\r
\r
            summaries = aggregateDaily(self.pipelineInstance.enrichedData)\r
            reportObj = generateReport(self.pipelineInstance, summaries)\r
            qualityObj = DataQualityReport.fromPipeline(self.pipelineInstance)\r
\r
            return {\r
                "status": "completed",\r
                "summary": {\r
                    "processed": reportObj.pipelineStats["processedCount"],\r
                    "successful": reportObj.pipelineStats["successCount"],\r
                    "failed": reportObj.pipelineStats["errorCount"],\r
                    "validationRate": qualityObj.validationRate\r
                },\r
                "report": reportObj,\r
                "quality": qualityObj\r
            }\r
\r
    completePipeline = CompletePipeline()\r
    finalResult = completePipeline.run(sampleData)\r
    finalResult["summary"]\r
  exercise:\r
    prompt: 통합 파이프라인 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      class CompletePipeline:\r
          def __init__(self):\r
              self.pipelineInstance = DataPipeline()\r
\r
          def run(self, rawData: list[dict]) -> dict:\r
              self.pipelineInstance.extract(rawData)\r
              self.pipelineInstance.transform()\r
\r
              summaries = aggregateDaily(self.pipelineInstance.enrichedData)\r
              reportObj = generateReport(self.pipelineInstance, summaries)\r
              qualityObj = DataQualityReport.fromPipeline(self.pipelineInstance)\r
\r
              return {\r
                  "status": "completed",\r
                  "summary": {\r
                      "processed": reportObj.pipelineStats["processedCount"],\r
                      "successful": reportObj.pipelineStats["successCount"],\r
                      "failed": reportObj.pipelineStats["errorCount"],\r
                      "validationRate": qualityObj.validationRate\r
                  },\r
                  "report": reportObj,\r
                  "quality": qualityObj\r
              }\r
\r
      completePipeline = CompletePipeline()\r
      finalResult = completePipeline.run(sampleData)\r
      finalResult["summary"]\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    noError: 통합 파이프라인의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 통합 파이프라인 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 데이터 파이프라인 확장\r
  goal: 실습에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: |-\r
    다양한 도메인에 맞는 데이터 파이프라인을 구축해봅니다. 각 미션은 실무에서 자주 접하는 시나리오를 다룹니다. 로그 분석 파이프라인은 서버 모니터링과 장애 탐지에, 센서 데이터 파이프라인은 IoT와 제조 시스템에 활용됩니다. 핵심은 Raw → Validated → Enriched → Aggregated의 단계별 변환과, 각 단계에서 Pydantic 모델을 활용한 타입 안전성 확보입니다.\r
\r
    파이프라인 설계 시 각 단계의 모델을 명확히 분리하고, 변환 로직은 클래스 메서드로 캡슐화하세요. 오류는 무시하지 말고 별도로 수집하여 품질 모니터링에 활용합니다. computed_field로 파생 지표를 자동 계산하면 일관성을 유지할 수 있습니다.\r
  tips:\r
  - 파이프라인 설계 시 각 단계의 모델을 명확히 분리하고, 변환 로직은 클래스 메서드로 캡슐화하세요. 오류는 무시하지 말고 별도로 수집하여 품질 모니터링에 활용합니다. computed_field로\r
    파생 지표를 자동 계산하면 일관성을 유지할 수 있습니다.\r
  snippet: |-\r
    from pydantic import BaseModel, Field, ValidationError, field_validator\r
    from typing import Optional, Literal\r
    from datetime import datetime\r
    from collections import defaultdict\r
\r
    class RawLogEntry(BaseModel):\r
        timestamp: str\r
        level: str\r
        service: str\r
        message: str\r
        traceId: Optional[str] = None\r
\r
    class ParsedLogEntry(BaseModel):\r
        timestamp: datetime\r
        level: Literal["DEBUG", "INFO", "WARN", "ERROR", "FATAL"]\r
        service: str\r
        message: str\r
        traceId: Optional[str] = None\r
\r
        @field_validator('level', mode='before')\r
        @classmethod\r
        def normalizeLevel(cls, v):\r
            return v.upper()\r
\r
        @field_validator('timestamp', mode='before')\r
        @classmethod\r
        def parseTs(cls, v):\r
            if isinstance(v, str):\r
                return datetime.fromisoformat(v.replace("Z", "+00:00").replace(" ", "T"))\r
            return v\r
\r
    class LogAnalytics(BaseModel):\r
        totalLogs: int\r
        invalidLogs: int\r
        byLevel: dict[str, int]\r
        byService: dict[str, int]\r
        errorRate: float\r
        timeRange: dict\r
\r
    def analyzeLogs(rawLogs: list[dict]) -> LogAnalytics:\r
        parsed = []\r
        rejected = []\r
        for raw in rawLogs:\r
            try:\r
                entry = ParsedLogEntry.model_validate(raw)\r
                parsed.append(entry)\r
            except ValidationError as exc:\r
                rejected.append({"raw": raw, "error": exc.errors()[0]["msg"]})\r
\r
        byLevel = defaultdict(int)\r
        byService = defaultdict(int)\r
        for log in parsed:\r
            byLevel[log.level] += 1\r
            byService[log.service] += 1\r
\r
        errorCount = byLevel.get("ERROR", 0) + byLevel.get("FATAL", 0)\r
        timestamps = [log.timestamp for log in parsed]\r
\r
        return LogAnalytics(\r
            totalLogs=len(parsed),\r
            invalidLogs=len(rejected),\r
            byLevel=dict(byLevel),\r
            byService=dict(byService),\r
            errorRate=round(errorCount / len(parsed) * 100, 2) if parsed else 0,\r
            timeRange={\r
                "start": min(timestamps).isoformat() if timestamps else None,\r
                "end": max(timestamps).isoformat() if timestamps else None\r
            }\r
        )\r
\r
    testLogs = [\r
        {"timestamp": "2024-03-15T10:00:00", "level": "info", "service": "api", "message": "Request received"},\r
        {"timestamp": "2024-03-15T10:01:00", "level": "error", "service": "db", "message": "Connection failed"},\r
        {"timestamp": "2024-03-15T10:02:00", "level": "info", "service": "api", "message": "Request completed"},\r
        {"timestamp": "2024-03-15T10:03:00", "level": "warn", "service": "cache", "message": "Cache miss"}\r
    ]\r
\r
    logAnalyticsResult = analyzeLogs(testLogs)\r
    logAnalyticsResult.model_dump()\r
  exercise:\r
    prompt: 실습 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      from pydantic import BaseModel, Field, ValidationError, field_validator\r
      from typing import Optional, Literal\r
      from datetime import datetime\r
      from collections import defaultdict\r
\r
      class RawLogEntry(BaseModel):\r
          timestamp: str\r
          level: str\r
          service: str\r
          message: str\r
          traceId: Optional[str] = None\r
\r
      class ParsedLogEntry(BaseModel):\r
          timestamp: datetime\r
          level: Literal["DEBUG", "INFO", "WARN", "ERROR", "FATAL"]\r
          service: str\r
          message: str\r
          traceId: Optional[str] = None\r
\r
          @field_validator('level', mode='before')\r
          @classmethod\r
          def normalizeLevel(cls, v):\r
              return v.upper()\r
\r
          @field_validator('timestamp', mode='before')\r
          @classmethod\r
          def parseTs(cls, v):\r
              if isinstance(v, str):\r
                  return datetime.fromisoformat(v.replace("Z", "+00:00").replace(" ", "T"))\r
              return v\r
\r
      class LogAnalytics(BaseModel):\r
          totalLogs: int\r
          invalidLogs: int\r
          byLevel: dict[str, int]\r
          byService: dict[str, int]\r
          errorRate: float\r
          timeRange: dict\r
\r
      def analyzeLogs(rawLogs: list[dict]) -> LogAnalytics:\r
          parsed = []\r
          rejected = []\r
          for raw in rawLogs:\r
              try:\r
                  entry = ParsedLogEntry.model_validate(raw)\r
                  parsed.append(entry)\r
              except ValidationError as exc:\r
                  rejected.append({"raw": raw, "error": exc.errors()[0]["msg"]})\r
\r
          byLevel = defaultdict(int)\r
          byService = defaultdict(int)\r
          for log in parsed:\r
              byLevel[log.level] += 1\r
              byService[log.service] += 1\r
\r
          errorCount = byLevel.get("ERROR", 0) + byLevel.get("FATAL", 0)\r
          timestamps = [log.timestamp for log in parsed]\r
\r
          return LogAnalytics(\r
              totalLogs=len(parsed),\r
              invalidLogs=len(rejected),\r
              byLevel=dict(byLevel),\r
              byService=dict(byService),\r
              errorRate=round(errorCount / len(parsed) * 100, 2) if parsed else 0,\r
              timeRange={\r
                  "start": min(timestamps).isoformat() if timestamps else None,\r
                  "end": max(timestamps).isoformat() if timestamps else None\r
              }\r
          )\r
\r
      testLogs = [\r
          {"timestamp": "2024-03-15T10:00:00", "level": "info", "service": "api", "message": "Request received"},\r
          {"timestamp": "2024-03-15T10:01:00", "level": "error", "service": "db", "message": "Connection failed"},\r
          {"timestamp": "2024-03-15T10:02:00", "level": "info", "service": "api", "message": "Request completed"},\r
          {"timestamp": "2024-03-15T10:03:00", "level": "warn", "service": "cache", "message": "Cache miss"}\r
      ]\r
\r
      logAnalyticsResult = analyzeLogs(testLogs)\r
      logAnalyticsResult.model_dump()\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
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