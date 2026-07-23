var e=`meta:
  packages:
  - pydantic
  id: pydantic_10
  title: 종합데이터파이프라인
  order: 10
  category: pydantic
  difficulty: ⭐⭐⭐⭐⭐
  badge: 심화
  tags:
  - pydantic
  - 데이터파이프라인
  - ETL
  - 검증
  - 변환
  seo:
    title: Pydantic 종합 프로젝트 - 데이터 파이프라인 구축
    description: Pydantic으로 완전한 데이터 파이프라인을 구축합니다. ETL, 검증, 변환, 보고서 생성을 배웁니다.
    keywords:
    - pydantic
    - 데이터파이프라인
    - ETL
    - 프로젝트
intro:
  emoji: 🚀
  goal: Pydantic으로 완전한 데이터 처리 파이프라인을 구축합니다.
  description: 데이터 수집, 검증, 변환, 집계, 보고서 생성까지 전체 ETL 과정을 Pydantic 모델로 구현합니다.
  direction: 종합데이터파이프라인에서 입력 스키마를 정의하고 검증된 데이터만 처리 흐름에 넘김합니다.
  benefits:
  - 외부 입력 확인 후 스키마 검증에 맞는 코드 입력을 고릅니다.
  - 종합데이터파이프라인 결과를 성공 모델과 오류 메시지 기준으로 즉시 점검합니다.
  - 완료한 코드를 API/자동화 입력 계약에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: 환경 설정 입력 확인
      detail: 입력 기준(외부 입력)과 필요한 조건을 먼저 고정합니다.
    - label: 소스 데이터 모델 처리 실행
      detail: 스키마 검증 코드를 실행해 중간 결과를 확인합니다.
    - label: 검증 모델 결과 검증
      detail: 성공 모델과 오류 메시지 기준으로 실행 결과를 비교합니다.
    - label: 종합데이터파이프라인 재사용
      detail: 완성 코드를 API/자동화 입력 계약에 붙일 수 있게 정리합니다.
    runtime:
    - label: 데이터 계약 환경
      detail: pydantic 기준으로 로컬 Python 실행을 준비합니다.
    - label: 종합데이터파이프라인 실행
      detail: 셀을 실행해 성공 모델과 오류 메시지와 예외 상태를 확인합니다.
    - label: 종합데이터파이프라인 완료
      detail: 검증된 코드를 API/자동화 입력 계약로 남깁니다.
project:
  name: 전자상거래 거래 분석 파이프라인
  scenario: 매일 수만 건의 거래 데이터가 다양한 형식으로 유입됩니다. 원본 데이터를 검증하고, 분석 가능한 형태로 변환한 뒤, 일별/사용자별 통계와 품질 리포트를 자동 생성하는
    ETL 파이프라인을 구축합니다.
sections:
- id: load
  title: 환경 설정
  structuredPrimary: true
  subtitle: 패키지 로드
  goal: 환경 설정에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.
  why: import 준비가 정확해야 다음 셀과 자동화 코드에서 같은 이름을 안정적으로 재사용할 수 있습니다.
  explanation: 데이터 파이프라인에 필요한 pydantic과 보조 모듈을 로드합니다. ETL 파이프라인은 Extract(추출), Transform(변환), Load(적재)의
    세 단계로 구성되며, Pydantic은 각 단계에서 데이터 구조와 유효성을 보장하는 핵심 역할을 담당합니다. 특히 외부 시스템에서 들어오는 비정형 데이터를 정형화하고, 변환 과정의
    타입 안전성을 확보하는 데 Pydantic의 강점이 발휘됩니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: import pydantic
  exercise:
    prompt: 환경 설정 예제에서 import한 모듈의 별칭이나 바로 이어지는 확인 호출을 바꿔 준비 상태를 확인하세요.
    starterCode: import pydantic
    hints:
    - 바꿀 지점은 외부 입력을 만드는 첫 줄과 스키마 검증 줄에서 찾으세요.
    - 실행 뒤 성공 모델과 오류 메시지 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    type: noError
    noError: 환경 설정의 import 대상 모듈과 별칭이 현재 로컬 환경에서 준비되어야 합니다.
    resultCheck: 환경 설정 실행 결과가 성공 모델과 오류 메시지 기준으로 바꾼 입력값을 반영해야 합니다.
- id: source
  title: 소스 데이터 모델
  structuredPrimary: true
  subtitle: 원본 구조 정의
  goal: 소스 데이터 모델에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: 외부 시스템에서 수집되는 원본 데이터의 구조를 정의합니다. 원본 데이터는 타입이 모두 문자열이거나 불확실한 경우가 많으므로, 먼저 느슨한 모델로 수신한 뒤
    검증 단계에서 정확한 타입으로 변환합니다. 이 패턴은 실무에서 CSV, JSON API, 레거시 시스템 등 다양한 소스를 다룰 때 필수적입니다. RawTransaction은 거래
    데이터, RawUserEvent는 사용자 행동 로그를 담는 모델입니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    from pydantic import BaseModel, Field
    from typing import Optional
    from datetime import datetime, date
    from enum import Enum

    class RawTransaction(BaseModel):
        transactionId: str
        userId: str
        productId: str
        amount: str
        currency: str
        timestamp: str
        status: str
        metadata: Optional[dict] = None

    class RawUserEvent(BaseModel):
        eventId: str
        userId: str
        eventType: str
        eventData: dict
        occurredAt: str
        deviceInfo: Optional[dict] = None

    rawTx = RawTransaction(
        transactionId="TX001",
        userId="U100",
        productId="P001",
        amount="15000.50",
        currency="KRW",
        timestamp="2024-03-15 10:30:00",
        status="completed"
    )
    rawTx
  exercise:
    prompt: 소스 데이터 모델 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      from pydantic import BaseModel, Field
      from typing import Optional
      from datetime import datetime, date
      from enum import Enum

      class RawTransaction(BaseModel):
          transactionId: str
          userId: str
          productId: str
          amount: str
          currency: str
          timestamp: str
          status: str
          metadata: Optional[dict] = None

      class RawUserEvent(BaseModel):
          eventId: str
          userId: str
          eventType: str
          eventData: dict
          occurredAt: str
          deviceInfo: Optional[dict] = None

      rawTx = RawTransaction(
          transactionId="TX001",
          userId="U100",
          productId="P001",
          amount="15000.50",
          currency="KRW",
          timestamp="2024-03-15 10:30:00",
          status="completed"
      )
      rawTx
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    type: noError
    noError: 소스 데이터 모델에서 \`rawTx\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 소스 데이터 모델 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: validated
  title: 검증 모델
  structuredPrimary: true
  subtitle: 타입 변환과 검증
  goal: 검증 모델에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: 원본 데이터를 검증하고 올바른 타입으로 변환하는 모델입니다. field_validator의 mode='before'를 사용해 입력값이 모델에 할당되기 전에
    전처리합니다. 금액은 쉼표가 포함된 문자열일 수 있고, 날짜는 다양한 포맷으로 들어올 수 있으므로 유연하게 파싱합니다. TransactionStatus Enum으로 상태값을 제한하면
    잘못된 상태가 시스템에 유입되는 것을 원천 차단할 수 있습니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    from pydantic import field_validator
    from typing import Literal

    class TransactionStatus(str, Enum):
        PENDING = "pending"
        COMPLETED = "completed"
        FAILED = "failed"
        REFUNDED = "refunded"

    class ValidatedTransaction(BaseModel):
        transactionId: str = Field(min_length=1)
        userId: str = Field(min_length=1)
        productId: str = Field(min_length=1)
        amount: float = Field(gt=0)
        currency: Literal["KRW", "USD", "EUR"] = "KRW"
        timestamp: datetime
        status: TransactionStatus
        metadata: dict = Field(default_factory=dict)

        @field_validator('amount', mode='before')
        @classmethod
        def parseAmount(cls, v):
            if isinstance(v, str):
                return float(v.replace(",", ""))
            return v

        @field_validator('timestamp', mode='before')
        @classmethod
        def parseTimestamp(cls, v):
            if isinstance(v, str):
                formats = ["%Y-%m-%d %H:%M:%S", "%Y-%m-%dT%H:%M:%S", "%Y/%m/%d %H:%M:%S"]
                for fmt in formats:
                    try:
                        return datetime.strptime(v, fmt)
                    except ValueError:
                        continue
            return v

    validated = ValidatedTransaction(
        transactionId=rawTx.transactionId,
        userId=rawTx.userId,
        productId=rawTx.productId,
        amount=rawTx.amount,
        currency=rawTx.currency,
        timestamp=rawTx.timestamp,
        status=rawTx.status
    )
    validated
  exercise:
    prompt: 검증 모델 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      from pydantic import field_validator
      from typing import Literal

      class TransactionStatus(str, Enum):
          PENDING = "pending"
          COMPLETED = "completed"
          FAILED = "failed"
          REFUNDED = "refunded"

      class ValidatedTransaction(BaseModel):
          transactionId: str = Field(min_length=1)
          userId: str = Field(min_length=1)
          productId: str = Field(min_length=1)
          amount: float = Field(gt=0)
          currency: Literal["KRW", "USD", "EUR"] = "KRW"
          timestamp: datetime
          status: TransactionStatus
          metadata: dict = Field(default_factory=dict)

          @field_validator('amount', mode='before')
          @classmethod
          def parseAmount(cls, v):
              if isinstance(v, str):
                  return float(v.replace(",", ""))
              return v

          @field_validator('timestamp', mode='before')
          @classmethod
          def parseTimestamp(cls, v):
              if isinstance(v, str):
                  formats = ["%Y-%m-%d %H:%M:%S", "%Y-%m-%dT%H:%M:%S", "%Y/%m/%d %H:%M:%S"]
                  for fmt in formats:
                      try:
                          return datetime.strptime(v, fmt)
                      except ValueError:
                          continue
              return v

      validated = ValidatedTransaction(
          transactionId=rawTx.transactionId,
          userId=rawTx.userId,
          productId=rawTx.productId,
          amount=rawTx.amount,
          currency=rawTx.currency,
          timestamp=rawTx.timestamp,
          status=rawTx.status
      )
      validated
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 검증 모델의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 검증 모델 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: enriched
  title: 데이터 변환
  structuredPrimary: true
  subtitle: ETL Transform
  goal: 데이터 변환에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: 검증된 데이터를 분석에 적합한 형태로 변환합니다. 원본 통화를 KRW로 환산하고, 날짜에서 요일과 시간대 정보를 추출하며, 성공 여부를 불리언으로 표현합니다.
    fromValidated 클래스 메서드 패턴을 사용하면 변환 로직을 모델 내부에 캡슐화하여 재사용성을 높일 수 있습니다. 이렇게 풍부해진 데이터는 일별 매출 분석, 요일별 패턴
    분석, 주말/평일 비교 등 다양한 분석에 활용됩니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    class EnrichedTransaction(BaseModel):
        transactionId: str
        userId: str
        productId: str
        amountKRW: float
        originalCurrency: str
        originalAmount: float
        transactionDate: date
        transactionHour: int
        dayOfWeek: int
        isWeekend: bool
        status: TransactionStatus
        isSuccessful: bool

        @classmethod
        def fromValidated(cls, tx: ValidatedTransaction) -> "EnrichedTransaction":
            exchangeRates = {"KRW": 1, "USD": 1300, "EUR": 1400}
            rate = exchangeRates.get(tx.currency, 1)

            return cls(
                transactionId=tx.transactionId,
                userId=tx.userId,
                productId=tx.productId,
                amountKRW=tx.amount * rate,
                originalCurrency=tx.currency,
                originalAmount=tx.amount,
                transactionDate=tx.timestamp.date(),
                transactionHour=tx.timestamp.hour,
                dayOfWeek=tx.timestamp.weekday(),
                isWeekend=tx.timestamp.weekday() >= 5,
                status=tx.status,
                isSuccessful=tx.status == TransactionStatus.COMPLETED
            )

    enriched = EnrichedTransaction.fromValidated(validated)
    enriched
  exercise:
    prompt: 데이터 변환 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      class EnrichedTransaction(BaseModel):
          transactionId: str
          userId: str
          productId: str
          amountKRW: float
          originalCurrency: str
          originalAmount: float
          transactionDate: date
          transactionHour: int
          dayOfWeek: int
          isWeekend: bool
          status: TransactionStatus
          isSuccessful: bool

          @classmethod
          def fromValidated(cls, tx: ValidatedTransaction) -> "EnrichedTransaction":
              exchangeRates = {"KRW": 1, "USD": 1300, "EUR": 1400}
              rate = exchangeRates.get(tx.currency, 1)

              return cls(
                  transactionId=tx.transactionId,
                  userId=tx.userId,
                  productId=tx.productId,
                  amountKRW=tx.amount * rate,
                  originalCurrency=tx.currency,
                  originalAmount=tx.amount,
                  transactionDate=tx.timestamp.date(),
                  transactionHour=tx.timestamp.hour,
                  dayOfWeek=tx.timestamp.weekday(),
                  isWeekend=tx.timestamp.weekday() >= 5,
                  status=tx.status,
                  isSuccessful=tx.status == TransactionStatus.COMPLETED
              )

      enriched = EnrichedTransaction.fromValidated(validated)
      enriched
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    noError: 데이터 변환의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 데이터 변환 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: aggregate
  title: 집계 모델
  structuredPrimary: true
  subtitle: 통계 계산
  goal: 집계 모델에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: 변환된 데이터를 집계하여 일별, 사용자별 통계를 생성합니다. DailySummary는 하루 동안의 거래 현황을 요약하고, UserSummary는 고객별 구매
    패턴을 분석합니다. computed_field를 사용해 성공률이나 고객 생애 일수 같은 파생 지표를 자동 계산하면, 지표 산출 로직이 모델에 응집되어 일관성을 유지할 수 있습니다.
    이런 집계 모델은 대시보드나 리포트의 기반 데이터가 됩니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    from pydantic import computed_field

    class DailySummary(BaseModel):
        summaryDate: date
        totalTransactions: int
        successfulTransactions: int
        failedTransactions: int
        totalAmountKRW: float
        averageAmountKRW: float
        uniqueUsers: int
        uniqueProducts: int

        @computed_field
        @property
        def successRate(self) -> float:
            if self.totalTransactions == 0:
                return 0.0
            return round(self.successfulTransactions / self.totalTransactions * 100, 2)

    class UserSummary(BaseModel):
        userId: str
        totalTransactions: int
        totalSpentKRW: float
        averageOrderKRW: float
        firstTransactionDate: date
        lastTransactionDate: date
        favoriteProductId: Optional[str] = None

        @computed_field
        @property
        def customerLifetimeDays(self) -> int:
            return (self.lastTransactionDate - self.firstTransactionDate).days
  exercise:
    prompt: 집계 모델 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      from pydantic import computed_field

      class DailySummary(BaseModel):
          summaryDate: date
          totalTransactions: int
          successfulTransactions: int
          failedTransactions: int
          totalAmountKRW: float
          averageAmountKRW: float
          uniqueUsers: int
          uniqueProducts: int

          @computed_field
          @property
          def successRate(self) -> float:
              if self.totalTransactions == 0:
                  return 0.0
              return round(self.successfulTransactions / self.totalTransactions * 100, 2)

      class UserSummary(BaseModel):
          userId: str
          totalTransactions: int
          totalSpentKRW: float
          averageOrderKRW: float
          firstTransactionDate: date
          lastTransactionDate: date
          favoriteProductId: Optional[str] = None

          @computed_field
          @property
          def customerLifetimeDays(self) -> int:
              return (self.lastTransactionDate - self.firstTransactionDate).days
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 집계 모델의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 집계 모델 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: pipeline
  title: 파이프라인 클래스
  structuredPrimary: true
  subtitle: ETL 구현
  goal: 파이프라인 클래스에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: 데이터 수집부터 집계까지 전체 파이프라인을 클래스로 구현합니다. DataPipeline 클래스는 extract와 transform 메서드로 ETL의 E와 T를
    담당하며, 각 단계에서 발생한 오류를 별도로 수집합니다. 이 패턴은 파이프라인 실행 중 일부 레코드가 실패해도 나머지는 계속 처리할 수 있게 하고, 오류 분석을 위한 정보를 보존합니다.
    PipelineResult 모델로 처리 결과를 구조화하면 후속 모니터링과 알림 시스템 연동이 용이해집니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    from pydantic import ValidationError

    class PipelineResult(BaseModel):
        processedCount: int
        successCount: int
        errorCount: int
        errors: list[dict] = []
        enrichedData: list[dict] = []

    class DataPipeline:
        def __init__(self):
            self.rawData = []
            self.validatedData = []
            self.enrichedData = []
            self.errors = []

        def extract(self, rawRecords: list[dict]) -> int:
            self.rawData = []
            for record in rawRecords:
                try:
                    raw = RawTransaction.model_validate(record)
                    self.rawData.append(raw)
                except ValidationError as e:
                    self.errors.append({"stage": "extract", "data": record, "error": str(e)})
            return len(self.rawData)

        def transform(self) -> int:
            self.validatedData = []
            self.enrichedData = []
            for raw in self.rawData:
                try:
                    validatedItem = ValidatedTransaction(
                        transactionId=raw.transactionId,
                        userId=raw.userId,
                        productId=raw.productId,
                        amount=raw.amount,
                        currency=raw.currency,
                        timestamp=raw.timestamp,
                        status=raw.status,
                        metadata=raw.metadata or {}
                    )
                    self.validatedData.append(validatedItem)
                    enrichedItem = EnrichedTransaction.fromValidated(validatedItem)
                    self.enrichedData.append(enrichedItem)
                except ValidationError as e:
                    self.errors.append({"stage": "transform", "data": raw.model_dump(), "error": str(e)})
            return len(self.enrichedData)

        def getResult(self) -> PipelineResult:
            return PipelineResult(
                processedCount=len(self.rawData),
                successCount=len(self.enrichedData),
                errorCount=len(self.errors),
                errors=self.errors,
                enrichedData=[e.model_dump() for e in self.enrichedData]
            )

    pipeline = DataPipeline()
  exercise:
    prompt: 파이프라인 클래스 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      from pydantic import ValidationError

      class PipelineResult(BaseModel):
          processedCount: int
          successCount: int
          errorCount: int
          errors: list[dict] = []
          enrichedData: list[dict] = []

      class DataPipeline:
          def __init__(self):
              self.rawData = []
              self.validatedData = []
              self.enrichedData = []
              self.errors = []

          def extract(self, rawRecords: list[dict]) -> int:
              self.rawData = []
              for record in rawRecords:
                  try:
                      raw = RawTransaction.model_validate(record)
                      self.rawData.append(raw)
                  except ValidationError as e:
                      self.errors.append({"stage": "extract", "data": record, "error": str(e)})
              return len(self.rawData)

          def transform(self) -> int:
              self.validatedData = []
              self.enrichedData = []
              for raw in self.rawData:
                  try:
                      validatedItem = ValidatedTransaction(
                          transactionId=raw.transactionId,
                          userId=raw.userId,
                          productId=raw.productId,
                          amount=raw.amount,
                          currency=raw.currency,
                          timestamp=raw.timestamp,
                          status=raw.status,
                          metadata=raw.metadata or {}
                      )
                      self.validatedData.append(validatedItem)
                      enrichedItem = EnrichedTransaction.fromValidated(validatedItem)
                      self.enrichedData.append(enrichedItem)
                  except ValidationError as e:
                      self.errors.append({"stage": "transform", "data": raw.model_dump(), "error": str(e)})
              return len(self.enrichedData)

          def getResult(self) -> PipelineResult:
              return PipelineResult(
                  processedCount=len(self.rawData),
                  successCount=len(self.enrichedData),
                  errorCount=len(self.errors),
                  errors=self.errors,
                  enrichedData=[e.model_dump() for e in self.enrichedData]
              )

      pipeline = DataPipeline()
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 파이프라인 클래스의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 파이프라인 클래스 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: execute
  title: 파이프라인 실행
  structuredPrimary: true
  subtitle: 샘플 데이터 처리
  goal: 파이프라인 실행에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: 샘플 거래 데이터로 파이프라인을 실행합니다. 테스트 데이터에는 정상 케이스와 함께 "invalid" 금액처럼 의도적으로 오류를 유발하는 데이터를 포함시켜 오류
    처리가 제대로 동작하는지 확인합니다. USD 거래는 환율 변환이 적용되고, pending/failed 상태는 isSuccessful이 false가 됩니다. 이렇게 다양한 시나리오를
    테스트하면 실제 운영 환경에서 발생할 수 있는 상황에 대비할 수 있습니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    sampleData = [
        {"transactionId": "TX001", "userId": "U100", "productId": "P001", "amount": "15000", "currency": "KRW", "timestamp": "2024-03-15 10:30:00", "status": "completed"},
        {"transactionId": "TX002", "userId": "U101", "productId": "P002", "amount": "25000.50", "currency": "KRW", "timestamp": "2024-03-15 11:00:00", "status": "completed"},
        {"transactionId": "TX003", "userId": "U100", "productId": "P003", "amount": "invalid", "currency": "KRW", "timestamp": "2024-03-15 12:00:00", "status": "completed"},
        {"transactionId": "TX004", "userId": "U102", "productId": "P001", "amount": "100", "currency": "USD", "timestamp": "2024-03-15 14:30:00", "status": "pending"},
        {"transactionId": "TX005", "userId": "U101", "productId": "P004", "amount": "50000", "currency": "KRW", "timestamp": "2024-03-15 15:00:00", "status": "failed"},
        {"transactionId": "TX006", "userId": "U103", "productId": "P002", "amount": "30000", "currency": "KRW", "timestamp": "2024-03-16 09:00:00", "status": "completed"}
    ]

    extractedCount = pipeline.extract(sampleData)
    transformedCount = pipeline.transform()
    extractedCount, transformedCount
  exercise:
    prompt: 파이프라인 실행 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      sampleData = [
          {"transactionId": "TX001", "userId": "U100", "productId": "P001", "amount": "15000", "currency": "KRW", "timestamp": "2024-03-15 10:30:00", "status": "completed"},
          {"transactionId": "TX002", "userId": "U101", "productId": "P002", "amount": "25000.50", "currency": "KRW", "timestamp": "2024-03-15 11:00:00", "status": "completed"},
          {"transactionId": "TX003", "userId": "U100", "productId": "P003", "amount": "invalid", "currency": "KRW", "timestamp": "2024-03-15 12:00:00", "status": "completed"},
          {"transactionId": "TX004", "userId": "U102", "productId": "P001", "amount": "100", "currency": "USD", "timestamp": "2024-03-15 14:30:00", "status": "pending"},
          {"transactionId": "TX005", "userId": "U101", "productId": "P004", "amount": "50000", "currency": "KRW", "timestamp": "2024-03-15 15:00:00", "status": "failed"},
          {"transactionId": "TX006", "userId": "U103", "productId": "P002", "amount": "30000", "currency": "KRW", "timestamp": "2024-03-16 09:00:00", "status": "completed"}
      ]

      extractedCount = pipeline.extract(sampleData)
      transformedCount = pipeline.transform()
      extractedCount, transformedCount
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    noError: 파이프라인 실행에서 \`sampleData\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 파이프라인 실행 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: aggregation
  title: 데이터 집계
  structuredPrimary: true
  subtitle: 통계 생성
  goal: 데이터 집계에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: 처리된 데이터를 집계하여 일별 통계를 생성합니다. aggregateDaily 함수는 거래를 날짜별로 그룹화한 뒤 각 그룹에 대해 DailySummary를 생성합니다.
    성공 거래 수, 총 거래액, 평균 거래액, 고유 사용자 수 등 핵심 지표를 계산합니다. 이 집계 결과는 경영진 대시보드, 일일 리포트, 이상 탐지 시스템 등에 활용됩니다. computed_field로
    정의한 successRate는 자동으로 계산되어 직렬화에 포함됩니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    from collections import defaultdict

    def aggregateDaily(transactions: list[EnrichedTransaction]) -> list[DailySummary]:
        byDate = defaultdict(list)
        for tx in transactions:
            byDate[tx.transactionDate].append(tx)

        summaries = []
        for txDate, txList in sorted(byDate.items()):
            successful = [tx for tx in txList if tx.isSuccessful]
            amounts = [tx.amountKRW for tx in txList]
            summaries.append(DailySummary(
                summaryDate=txDate,
                totalTransactions=len(txList),
                successfulTransactions=len(successful),
                failedTransactions=len(txList) - len(successful),
                totalAmountKRW=sum(amounts),
                averageAmountKRW=sum(amounts) / len(amounts) if amounts else 0,
                uniqueUsers=len(set(tx.userId for tx in txList)),
                uniqueProducts=len(set(tx.productId for tx in txList))
            ))
        return summaries

    dailySummaries = aggregateDaily(pipeline.enrichedData)
    dailySummaries[0].model_dump() if dailySummaries else {}
  exercise:
    prompt: 데이터 집계 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      from collections import defaultdict

      def aggregateDaily(transactions: list[EnrichedTransaction]) -> list[DailySummary]:
          byDate = defaultdict(list)
          for tx in transactions:
              byDate[tx.transactionDate].append(tx)

          summaries = []
          for txDate, txList in sorted(byDate.items()):
              successful = [tx for tx in txList if tx.isSuccessful]
              amounts = [tx.amountKRW for tx in txList]
              summaries.append(DailySummary(
                  summaryDate=txDate,
                  totalTransactions=len(txList),
                  successfulTransactions=len(successful),
                  failedTransactions=len(txList) - len(successful),
                  totalAmountKRW=sum(amounts),
                  averageAmountKRW=sum(amounts) / len(amounts) if amounts else 0,
                  uniqueUsers=len(set(tx.userId for tx in txList)),
                  uniqueProducts=len(set(tx.productId for tx in txList))
              ))
          return summaries

      dailySummaries = aggregateDaily(pipeline.enrichedData)
      dailySummaries[0].model_dump() if dailySummaries else {}
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 데이터 집계의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 데이터 집계 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: report
  title: 보고서 모델
  structuredPrimary: true
  subtitle: 종합 리포트
  goal: 보고서 모델에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: 집계 결과를 종합한 최종 보고서 모델을 정의합니다. PipelineReport는 파이프라인 실행 메타데이터, 일별 요약, 상위 상품/사용자 랭킹을 하나의 구조로
    통합합니다. generateReport 함수는 파이프라인과 집계 결과를 받아 리포트를 생성합니다. 리포트 ID에 타임스탬프를 포함시키면 버전 관리가 용이하고, periodDays
    computed_field로 분석 기간을 자동 계산합니다. 이 리포트는 JSON으로 직렬화되어 API 응답이나 파일 저장에 활용됩니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    class PipelineReport(BaseModel):
        reportId: str
        generatedAt: datetime
        periodStart: date
        periodEnd: date
        pipelineStats: dict
        dailySummaries: list[DailySummary]
        topProducts: list[dict]
        topUsers: list[dict]

        @computed_field
        @property
        def periodDays(self) -> int:
            return (self.periodEnd - self.periodStart).days + 1

    def generateReport(pipelineObj: DataPipeline, summaries: list[DailySummary]) -> PipelineReport:
        transactions = pipelineObj.enrichedData

        productCounts = defaultdict(int)
        userSpending = defaultdict(float)
        for tx in transactions:
            productCounts[tx.productId] += 1
            userSpending[tx.userId] += tx.amountKRW

        topProducts = [{"productId": k, "count": v} for k, v in sorted(productCounts.items(), key=lambda x: -x[1])[:5]]
        topUsers = [{"userId": k, "totalSpent": v} for k, v in sorted(userSpending.items(), key=lambda x: -x[1])[:5]]

        dates = [tx.transactionDate for tx in transactions]
        return PipelineReport(
            reportId=f"RPT-{datetime.now().strftime('%Y%m%d%H%M%S')}",
            generatedAt=datetime.now(),
            periodStart=min(dates) if dates else date.today(),
            periodEnd=max(dates) if dates else date.today(),
            pipelineStats=pipelineObj.getResult().model_dump(exclude={"enrichedData"}),
            dailySummaries=summaries,
            topProducts=topProducts,
            topUsers=topUsers
        )

    report = generateReport(pipeline, dailySummaries)
    report.model_dump(exclude={"dailySummaries"})
  exercise:
    prompt: 보고서 모델 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      class PipelineReport(BaseModel):
          reportId: str
          generatedAt: datetime
          periodStart: date
          periodEnd: date
          pipelineStats: dict
          dailySummaries: list[DailySummary]
          topProducts: list[dict]
          topUsers: list[dict]

          @computed_field
          @property
          def periodDays(self) -> int:
              return (self.periodEnd - self.periodStart).days + 1

      def generateReport(pipelineObj: DataPipeline, summaries: list[DailySummary]) -> PipelineReport:
          transactions = pipelineObj.enrichedData

          productCounts = defaultdict(int)
          userSpending = defaultdict(float)
          for tx in transactions:
              productCounts[tx.productId] += 1
              userSpending[tx.userId] += tx.amountKRW

          topProducts = [{"productId": k, "count": v} for k, v in sorted(productCounts.items(), key=lambda x: -x[1])[:5]]
          topUsers = [{"userId": k, "totalSpent": v} for k, v in sorted(userSpending.items(), key=lambda x: -x[1])[:5]]

          dates = [tx.transactionDate for tx in transactions]
          return PipelineReport(
              reportId=f"RPT-{datetime.now().strftime('%Y%m%d%H%M%S')}",
              generatedAt=datetime.now(),
              periodStart=min(dates) if dates else date.today(),
              periodEnd=max(dates) if dates else date.today(),
              pipelineStats=pipelineObj.getResult().model_dump(exclude={"enrichedData"}),
              dailySummaries=summaries,
              topProducts=topProducts,
              topUsers=topUsers
          )

      report = generateReport(pipeline, dailySummaries)
      report.model_dump(exclude={"dailySummaries"})
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    noError: 보고서 모델의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 보고서 모델 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: export
  title: 데이터 내보내기
  structuredPrimary: true
  subtitle: JSON/CSV 출력
  goal: 데이터 내보내기에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.
  explanation: 처리된 데이터와 보고서를 다양한 형식으로 내보냅니다. model_dump(mode='json')을 사용하면 datetime, date, Enum 등이 JSON
    호환 형식으로 자동 변환됩니다. CSV 형식은 스프레드시트나 BI 도구에서 활용하기 좋고, JSON은 API 응답이나 NoSQL 저장소에 적합합니다. toCsvRows 함수처럼
    필요한 필드만 선택적으로 추출하면 출력 용량을 줄이고 보안에 민감한 필드를 제외할 수 있습니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    import json

    exportJson = {
        "report": report.model_dump(mode='json'),
        "transactions": [tx.model_dump(mode='json') for tx in pipeline.enrichedData[:3]]
    }
    jsonOutput = json.dumps(exportJson, indent=2, ensure_ascii=False, default=str)
    jsonOutput[:500]
  exercise:
    prompt: 데이터 내보내기 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.
    starterCode: |-
      import json

      exportJson = {
          "report": report.model_dump(mode='json'),
          "transactions": [tx.model_dump(mode='json') for tx in pipeline.enrichedData[:3]]
      }
      jsonOutput = json.dumps(exportJson, indent=2, ensure_ascii=False, default=str)
      jsonOutput[:500]
    hints:
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.
  check:
    noError: 데이터 내보내기의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.
    resultCheck: 데이터 내보내기 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.
- id: quality
  title: 품질 보고서
  structuredPrimary: true
  subtitle: 검증 통계
  goal: 품질 보고서에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: 데이터 품질 검증 결과를 상세히 보고합니다. DataQualityReport는 전체 레코드 중 유효한 레코드의 비율, 오류 유형별/단계별 분포, 샘플 오류
    메시지를 포함합니다. validationRate는 데이터 품질의 핵심 지표로, 이 값이 특정 임계치 이하로 떨어지면 소스 시스템에 문제가 있음을 의미합니다. 품질 보고서를 모니터링
    시스템과 연동하면 데이터 품질 저하를 조기에 탐지하고 대응할 수 있습니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    class DataQualityReport(BaseModel):
        totalRecords: int
        validRecords: int
        invalidRecords: int
        validationRate: float
        errorsByField: dict[str, int]
        errorsByType: dict[str, int]
        sampleErrors: list[dict]

        @classmethod
        def fromPipeline(cls, pipelineObj: DataPipeline) -> "DataQualityReport":
            errorsByField = defaultdict(int)
            errorsByType = defaultdict(int)

            for err in pipelineObj.errors:
                errorsByType[err.get("stage", "unknown")] += 1
                if "field" in err:
                    errorsByField[err["field"]] += 1

            total = len(pipelineObj.rawData) + len(pipelineObj.errors)
            valid = len(pipelineObj.enrichedData)

            return cls(
                totalRecords=total,
                validRecords=valid,
                invalidRecords=total - valid,
                validationRate=round(valid / total * 100, 2) if total > 0 else 0,
                errorsByField=dict(errorsByField),
                errorsByType=dict(errorsByType),
                sampleErrors=pipelineObj.errors[:5]
            )

    qualityReport = DataQualityReport.fromPipeline(pipeline)
    qualityReport.model_dump(exclude={"sampleErrors"})
  exercise:
    prompt: 품질 보고서 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      class DataQualityReport(BaseModel):
          totalRecords: int
          validRecords: int
          invalidRecords: int
          validationRate: float
          errorsByField: dict[str, int]
          errorsByType: dict[str, int]
          sampleErrors: list[dict]

          @classmethod
          def fromPipeline(cls, pipelineObj: DataPipeline) -> "DataQualityReport":
              errorsByField = defaultdict(int)
              errorsByType = defaultdict(int)

              for err in pipelineObj.errors:
                  errorsByType[err.get("stage", "unknown")] += 1
                  if "field" in err:
                      errorsByField[err["field"]] += 1

              total = len(pipelineObj.rawData) + len(pipelineObj.errors)
              valid = len(pipelineObj.enrichedData)

              return cls(
                  totalRecords=total,
                  validRecords=valid,
                  invalidRecords=total - valid,
                  validationRate=round(valid / total * 100, 2) if total > 0 else 0,
                  errorsByField=dict(errorsByField),
                  errorsByType=dict(errorsByType),
                  sampleErrors=pipelineObj.errors[:5]
              )

      qualityReport = DataQualityReport.fromPipeline(pipeline)
      qualityReport.model_dump(exclude={"sampleErrors"})
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 품질 보고서의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 품질 보고서 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: result
  title: 통합 파이프라인
  structuredPrimary: true
  subtitle: 전체 실행
  goal: 통합 파이프라인에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: 모든 구성 요소를 통합한 완성된 파이프라인입니다. CompletePipeline 클래스는 단일 run 메서드로 전체 ETL 과정과 집계, 리포트 생성을 수행합니다.
    반환값은 처리 상태, 요약 통계, 상세 리포트, 품질 보고서를 포함하는 딕셔너리입니다. 이 패턴은 배치 작업 스케줄러, API 엔드포인트, CLI 도구 등 다양한 실행 환경에서
    동일한 파이프라인 로직을 재사용할 수 있게 합니다. 실무에서는 여기에 로깅, 알림, 재시도 로직을 추가합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    class CompletePipeline:
        def __init__(self):
            self.pipelineInstance = DataPipeline()

        def run(self, rawData: list[dict]) -> dict:
            self.pipelineInstance.extract(rawData)
            self.pipelineInstance.transform()

            summaries = aggregateDaily(self.pipelineInstance.enrichedData)
            reportObj = generateReport(self.pipelineInstance, summaries)
            qualityObj = DataQualityReport.fromPipeline(self.pipelineInstance)

            return {
                "status": "completed",
                "summary": {
                    "processed": reportObj.pipelineStats["processedCount"],
                    "successful": reportObj.pipelineStats["successCount"],
                    "failed": reportObj.pipelineStats["errorCount"],
                    "validationRate": qualityObj.validationRate
                },
                "report": reportObj,
                "quality": qualityObj
            }

    completePipeline = CompletePipeline()
    finalResult = completePipeline.run(sampleData)
    finalResult["summary"]
  exercise:
    prompt: 통합 파이프라인 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      class CompletePipeline:
          def __init__(self):
              self.pipelineInstance = DataPipeline()

          def run(self, rawData: list[dict]) -> dict:
              self.pipelineInstance.extract(rawData)
              self.pipelineInstance.transform()

              summaries = aggregateDaily(self.pipelineInstance.enrichedData)
              reportObj = generateReport(self.pipelineInstance, summaries)
              qualityObj = DataQualityReport.fromPipeline(self.pipelineInstance)

              return {
                  "status": "completed",
                  "summary": {
                      "processed": reportObj.pipelineStats["processedCount"],
                      "successful": reportObj.pipelineStats["successCount"],
                      "failed": reportObj.pipelineStats["errorCount"],
                      "validationRate": qualityObj.validationRate
                  },
                  "report": reportObj,
                  "quality": qualityObj
              }

      completePipeline = CompletePipeline()
      finalResult = completePipeline.run(sampleData)
      finalResult["summary"]
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    noError: 통합 파이프라인의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 통합 파이프라인 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: practice
  title: 실습
  structuredPrimary: true
  subtitle: 데이터 파이프라인 확장
  goal: 실습에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: |-
    다양한 도메인에 맞는 데이터 파이프라인을 구축해봅니다. 각 미션은 실무에서 자주 접하는 시나리오를 다룹니다. 로그 분석 파이프라인은 서버 모니터링과 장애 탐지에, 센서 데이터 파이프라인은 IoT와 제조 시스템에 활용됩니다. 핵심은 Raw → Validated → Enriched → Aggregated의 단계별 변환과, 각 단계에서 Pydantic 모델을 활용한 타입 안전성 확보입니다.

    파이프라인 설계 시 각 단계의 모델을 명확히 분리하고, 변환 로직은 클래스 메서드로 캡슐화하세요. 오류는 무시하지 말고 별도로 수집하여 품질 모니터링에 활용합니다. computed_field로 파생 지표를 자동 계산하면 일관성을 유지할 수 있습니다.
  tips:
  - 파이프라인 설계 시 각 단계의 모델을 명확히 분리하고, 변환 로직은 클래스 메서드로 캡슐화하세요. 오류는 무시하지 말고 별도로 수집하여 품질 모니터링에 활용합니다. computed_field로
    파생 지표를 자동 계산하면 일관성을 유지할 수 있습니다.
  snippet: |-
    from pydantic import BaseModel, Field, ValidationError, field_validator
    from typing import Optional, Literal
    from datetime import datetime
    from collections import defaultdict

    class RawLogEntry(BaseModel):
        timestamp: str
        level: str
        service: str
        message: str
        traceId: Optional[str] = None

    class ParsedLogEntry(BaseModel):
        timestamp: datetime
        level: Literal["DEBUG", "INFO", "WARN", "ERROR", "FATAL"]
        service: str
        message: str
        traceId: Optional[str] = None

        @field_validator('level', mode='before')
        @classmethod
        def normalizeLevel(cls, v):
            return v.upper()

        @field_validator('timestamp', mode='before')
        @classmethod
        def parseTs(cls, v):
            if isinstance(v, str):
                return datetime.fromisoformat(v.replace("Z", "+00:00").replace(" ", "T"))
            return v

    class LogAnalytics(BaseModel):
        totalLogs: int
        invalidLogs: int
        byLevel: dict[str, int]
        byService: dict[str, int]
        errorRate: float
        timeRange: dict

    def analyzeLogs(rawLogs: list[dict]) -> LogAnalytics:
        parsed = []
        rejected = []
        for raw in rawLogs:
            try:
                entry = ParsedLogEntry.model_validate(raw)
                parsed.append(entry)
            except ValidationError as exc:
                rejected.append({"raw": raw, "error": exc.errors()[0]["msg"]})

        byLevel = defaultdict(int)
        byService = defaultdict(int)
        for log in parsed:
            byLevel[log.level] += 1
            byService[log.service] += 1

        errorCount = byLevel.get("ERROR", 0) + byLevel.get("FATAL", 0)
        timestamps = [log.timestamp for log in parsed]

        return LogAnalytics(
            totalLogs=len(parsed),
            invalidLogs=len(rejected),
            byLevel=dict(byLevel),
            byService=dict(byService),
            errorRate=round(errorCount / len(parsed) * 100, 2) if parsed else 0,
            timeRange={
                "start": min(timestamps).isoformat() if timestamps else None,
                "end": max(timestamps).isoformat() if timestamps else None
            }
        )

    testLogs = [
        {"timestamp": "2024-03-15T10:00:00", "level": "info", "service": "api", "message": "Request received"},
        {"timestamp": "2024-03-15T10:01:00", "level": "error", "service": "db", "message": "Connection failed"},
        {"timestamp": "2024-03-15T10:02:00", "level": "info", "service": "api", "message": "Request completed"},
        {"timestamp": "2024-03-15T10:03:00", "level": "warn", "service": "cache", "message": "Cache miss"}
    ]

    logAnalyticsResult = analyzeLogs(testLogs)
    logAnalyticsResult.model_dump()
  exercise:
    prompt: 실습 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      from pydantic import BaseModel, Field, ValidationError, field_validator
      from typing import Optional, Literal
      from datetime import datetime
      from collections import defaultdict

      class RawLogEntry(BaseModel):
          timestamp: str
          level: str
          service: str
          message: str
          traceId: Optional[str] = None

      class ParsedLogEntry(BaseModel):
          timestamp: datetime
          level: Literal["DEBUG", "INFO", "WARN", "ERROR", "FATAL"]
          service: str
          message: str
          traceId: Optional[str] = None

          @field_validator('level', mode='before')
          @classmethod
          def normalizeLevel(cls, v):
              return v.upper()

          @field_validator('timestamp', mode='before')
          @classmethod
          def parseTs(cls, v):
              if isinstance(v, str):
                  return datetime.fromisoformat(v.replace("Z", "+00:00").replace(" ", "T"))
              return v

      class LogAnalytics(BaseModel):
          totalLogs: int
          invalidLogs: int
          byLevel: dict[str, int]
          byService: dict[str, int]
          errorRate: float
          timeRange: dict

      def analyzeLogs(rawLogs: list[dict]) -> LogAnalytics:
          parsed = []
          rejected = []
          for raw in rawLogs:
              try:
                  entry = ParsedLogEntry.model_validate(raw)
                  parsed.append(entry)
              except ValidationError as exc:
                  rejected.append({"raw": raw, "error": exc.errors()[0]["msg"]})

          byLevel = defaultdict(int)
          byService = defaultdict(int)
          for log in parsed:
              byLevel[log.level] += 1
              byService[log.service] += 1

          errorCount = byLevel.get("ERROR", 0) + byLevel.get("FATAL", 0)
          timestamps = [log.timestamp for log in parsed]

          return LogAnalytics(
              totalLogs=len(parsed),
              invalidLogs=len(rejected),
              byLevel=dict(byLevel),
              byService=dict(byService),
              errorRate=round(errorCount / len(parsed) * 100, 2) if parsed else 0,
              timeRange={
                  "start": min(timestamps).isoformat() if timestamps else None,
                  "end": max(timestamps).isoformat() if timestamps else None
              }
          )

      testLogs = [
          {"timestamp": "2024-03-15T10:00:00", "level": "info", "service": "api", "message": "Request received"},
          {"timestamp": "2024-03-15T10:01:00", "level": "error", "service": "db", "message": "Connection failed"},
          {"timestamp": "2024-03-15T10:02:00", "level": "info", "service": "api", "message": "Request completed"},
          {"timestamp": "2024-03-15T10:03:00", "level": "warn", "service": "cache", "message": "Cache miss"}
      ]

      logAnalyticsResult = analyzeLogs(testLogs)
      logAnalyticsResult.model_dump()
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
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
  - id: pydantic_10-validated-data-pipeline-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - load
    - workflow_validation
    title: 원시 레코드를 검증·중복 제거·집계하는 pipeline 만들기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: 각 단계의 accepted·rejected·duplicate 증거와 category 합계를 함께 반환한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - validation 실패와 duplicate 제외를 다른 목록으로 남기세요.
    - 집계는 accepted 레코드에서만 수행하세요.
    exercise:
      prompt: run_validated_pipeline(rows)를 완성해 acceptedCount, rejectedIndexes, duplicateIds, totals를 반환하세요.
      starterCode: |-
        def run_validated_pipeline(rows):
            raise NotImplementedError
      solution: |
        def run_validated_pipeline(rows):
            seen = set()
            accepted = []
            rejected = []
            duplicates = []
            for index, row in enumerate(rows):
                try:
                    row_id = str(row["id"]).strip()
                    category = str(row["category"]).strip().lower()
                    amount = int(row["amount"])
                    if not row_id or not category or amount < 0:
                        raise ValueError
                except (KeyError, TypeError, ValueError):
                    rejected.append(index)
                    continue
                if row_id in seen:
                    duplicates.append(row_id)
                    continue
                seen.add(row_id)
                accepted.append({"id": row_id, "category": category, "amount": amount})
            totals = {}
            for row in accepted:
                totals[row["category"]] = totals.get(row["category"], 0) + row["amount"]
            return {"acceptedCount": len(accepted), "rejectedIndexes": rejected, "duplicateIds": duplicates, "totals": {key: totals[key] for key in sorted(totals)}}
      hints: *id001
    check:
      id: python.pydantic.pydantic_10.validated-data-pipeline.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.pydantic.pydantic_10.validated-data-pipeline.mastery.behavior.v1.fixture
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
        entry: run_validated_pipeline
        cases:
        - id: keeps-stage-evidence
          arguments:
          - value:
            - id: A
              category: ' Book '
              amount: '10'
            - id: A
              category: book
              amount: 20
            - id: B
              category: Music
              amount: 5
            - id: C
              amount: 1
          expectedReturn:
            acceptedCount: 2
            rejectedIndexes:
            - 3
            duplicateIds:
            - A
            totals:
              book: 10
              music: 5
        - id: handles-empty-pipeline
          arguments:
          - value: []
          expectedReturn:
            acceptedCount: 0
            rejectedIndexes: []
            duplicateIds: []
            totals: {}
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: pydantic_10-batch-contract-summary-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - pydantic_10-validated-data-pipeline-mastery
    title: 새 event batch의 schema version과 순서 계약 검증하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: 데이터 pipeline을 event version·sequence 중복·payload field 검사로 전이한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - version, sequence, payload 계약을 모두 통과한 event만 accepted에 넣으세요.
    - 중복 sequence도 rejected index로 남기세요.
    exercise:
      prompt: validate_event_batch(events, version, required_payload_keys)를 완성하세요.
      starterCode: |-
        def validate_event_batch(events, version, required_payload_keys):
            raise NotImplementedError
      solution: |
        def validate_event_batch(events, version, required_payload_keys):
            accepted = []
            rejected = []
            seen_sequences = set()
            for index, event in enumerate(events):
                sequence = event.get("sequence")
                payload = event.get("payload")
                valid = (
                    event.get("version") == version
                    and isinstance(sequence, int) and not isinstance(sequence, bool)
                    and sequence not in seen_sequences
                    and isinstance(payload, dict)
                    and all(key in payload for key in required_payload_keys)
                )
                if not valid:
                    rejected.append(index)
                    continue
                seen_sequences.add(sequence)
                accepted.append(sequence)
            return {"acceptedSequences": sorted(accepted), "rejectedIndexes": rejected, "nextSequence": max(accepted, default=0) + 1}
      hints: *id002
    check:
      id: python.pydantic.pydantic_10.batch-contract-summary.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.pydantic.pydantic_10.batch-contract-summary.transfer.behavior.v1.fixture
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
        entry: validate_event_batch
        cases:
        - id: validates-version-sequence-and-payload
          arguments:
          - value:
            - version: 2
              sequence: 2
              payload:
                id: B
            - version: 1
              sequence: 1
              payload:
                id: A
            - version: 2
              sequence: 2
              payload:
                id: dup
            - version: 2
              sequence: 3
              payload: {}
          - value: 2
          - value:
            - id
          expectedReturn:
            acceptedSequences:
            - 2
            rejectedIndexes:
            - 1
            - 2
            - 3
            nextSequence: 3
        - id: handles-empty-batch
          arguments:
          - value: []
          - value: 1
          - value:
            - id
          expectedReturn:
            acceptedSequences: []
            rejectedIndexes: []
            nextSequence: 1
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: pydantic_10-pipeline-evidence-stage-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - pydantic_10-batch-contract-summary-transfer
    title: 검증 pipeline 단계별 증거 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: ingest, validate, transform, persist 단계에 맞는 증거와 실패 위험을 구분한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - 각 단계가 몇 개의 레코드를 받았고 넘겼는지 추적하세요.
    - 최종 파일만 남기지 말고 schema version과 read-back 증거를 함께 보존하세요.
    exercise:
      prompt: choose_pipeline_evidence(situation)를 완성해 evidence, check, risk를 반환하세요.
      starterCode: |-
        def choose_pipeline_evidence(situation):
            raise NotImplementedError
      solution: |
        def choose_pipeline_evidence(situation):
            table = {'ingest': {'evidence': 'source hash and row count', 'check': 'read contract', 'risk': 'source drift'}, 'validate': {'evidence': 'accepted and rejected indexes', 'check': 'field paths', 'risk': 'silent bad rows'}, 'persist': {'evidence': 'artifact hash and schema version', 'check': 'read-back', 'risk': 'unreadable output'}}
            if situation not in table:
                raise ValueError('unknown situation')
            return table[situation]
      hints: *id003
    check:
      id: python.pydantic.pydantic_10.pipeline-evidence-stage.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.pydantic.pydantic_10.pipeline-evidence-stage.retrieval.behavior.v1.fixture
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
        entry: choose_pipeline_evidence
        cases:
        - id: recalls-ingest
          arguments:
          - value: ingest
          expectedReturn:
            evidence: source hash and row count
            check: read contract
            risk: source drift
        - id: recalls-validate
          arguments:
          - value: validate
          expectedReturn:
            evidence: accepted and rejected indexes
            check: field paths
            risk: silent bad rows
        - id: rejects-unknown-situation
          arguments:
          - value: unknown
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};