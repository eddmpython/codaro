var e=`meta:
  packages:
  - pydantic
  id: pydantic_09
  title: FastAPI통합
  order: 9
  category: pydantic
  difficulty: ⭐⭐⭐⭐
  badge: 고급
  tags:
  - pydantic
  - FastAPI
  - API
  - 웹개발
  - 스키마
  seo:
    title: Pydantic과 FastAPI - 웹 API 개발
    description: Pydantic 모델을 FastAPI와 통합합니다. 요청/응답 스키마, 자동 문서화, 검증을 배웁니다.
    keywords:
    - pydantic
    - FastAPI
    - API
    - 웹개발
intro:
  emoji: ⚡
  goal: Pydantic 모델로 완전한 REST API 모델 세트를 설계합니다.
  description: FastAPI는 Pydantic을 핵심 검증 엔진으로 사용하는 현대적인 웹 프레임워크입니다. 요청 본문, 응답 스키마, 쿼리 파라미터를 모두 Pydantic
    모델로 정의하면 자동 검증, 타입 변환, API 문서화까지 한번에 해결됩니다. 이 프로젝트에서는 실제 API에서 사용하는 CRUD 모델 패턴을 설계합니다.
  direction: FastAPI통합에서 입력 스키마를 정의하고 검증된 데이터만 처리 흐름에 넘김합니다.
  benefits:
  - 외부 입력 확인 후 스키마 검증에 맞는 코드 입력을 고릅니다.
  - FastAPI통합 결과를 성공 모델과 오류 메시지 기준으로 즉시 점검합니다.
  - 완료한 코드를 API/자동화 입력 계약에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: 라이브러리 로드 입력 확인
      detail: 입력 기준(외부 입력)과 필요한 조건을 먼저 고정합니다.
    - label: 요청 모델 처리 실행
      detail: 스키마 검증 코드를 실행해 중간 결과를 확인합니다.
    - label: 응답 모델 결과 검증
      detail: 성공 모델과 오류 메시지 기준으로 실행 결과를 비교합니다.
    - label: FastAPI통합 재사용
      detail: 완성 코드를 API/자동화 입력 계약에 붙일 수 있게 정리합니다.
    runtime:
    - label: 데이터 계약 환경
      detail: pydantic 기준으로 로컬 Python 실행을 준비합니다.
    - label: FastAPI통합 실행
      detail: 셀을 실행해 성공 모델과 오류 메시지와 예외 상태를 확인합니다.
    - label: FastAPI통합 완료
      detail: 검증된 코드를 API/자동화 입력 계약로 남깁니다.
sections:
- id: load
  title: 라이브러리 로드
  structuredPrimary: true
  subtitle: Pydantic import 확인
  goal: 라이브러리 로드에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.
  why: import 준비가 정확해야 다음 셀과 자동화 코드에서 같은 이름을 안정적으로 재사용할 수 있습니다.
  explanation: FastAPI는 Codaro 로컬 Python 환경에서 직접 실행하기 어렵지만, Pydantic 모델 설계는 동일합니다. FastAPI에서 요청 본문은 BaseModel로
    정의하고, 응답도 BaseModel로 정의하여 자동 직렬화와 OpenAPI 문서 생성이 가능합니다. 이 패턴을 익히면 실제 FastAPI 프로젝트에 바로 적용할 수 있습니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    import pydantic
    from typing import Optional, List
    from pydantic import BaseModel, Field, ValidationError
  exercise:
    prompt: 라이브러리 로드 예제에서 import한 모듈의 별칭이나 바로 이어지는 확인 호출을 바꿔 준비 상태를 확인하세요.
    starterCode: |-
      import pydantic
      from typing import Optional, List
      from pydantic import BaseModel, Field, ValidationError
    hints:
    - 바꿀 지점은 외부 입력을 만드는 첫 줄과 스키마 검증 줄에서 찾으세요.
    - 실행 뒤 성공 모델과 오류 메시지 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    type: noError
    noError: 라이브러리 로드의 import 대상 모듈과 별칭이 현재 로컬 환경에서 준비되어야 합니다.
    resultCheck: 라이브러리 로드 실행 결과가 성공 모델과 오류 메시지 기준으로 바꾼 입력값을 반영해야 합니다.
- id: request
  title: 요청 모델
  structuredPrimary: true
  subtitle: Request Body
  goal: 요청 모델에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    요청 본문을 Pydantic 모델로 정의하면 FastAPI가 자동으로 JSON을 파싱하고 검증합니다. 잘못된 데이터가 들어오면 422 Unprocessable Entity 응답이 자동으로 반환됩니다. 모델에 Field를 사용하면 OpenAPI 문서에 설명과 예시가 포함됩니다.

    요청 모델에는 password처럼 민감한 정보가 포함될 수 있습니다. 응답 모델에서는 이를 제외해야 합니다.
  snippet: |-
    class CreateUserRequest(BaseModel):
        username: str = Field(min_length=3, max_length=50, description="사용자명")
        email: str = Field(description="이메일 주소")
        password: str = Field(min_length=8, description="비밀번호")
        fullName: Optional[str] = Field(default=None, description="전체 이름")

    requestData = {
        "username": "alice",
        "email": "alice@example.com",
        "password": "secure123",
        "fullName": "Alice Smith"
    }
    createReq = CreateUserRequest.model_validate(requestData)
    createReq
  exercise:
    prompt: 요청 모델 예제에서 모델 필드나 입력 dict 값을 바꾸고 검증/직렬화 결과가 달라지는지 확인하세요.
    starterCode: |-
      class CreateUserRequest(BaseModel):
          username: str = Field(min_length=3, max_length=50, description="사용자명")
          email: str = Field(description="이메일 주소")
          password: str = Field(min_length=8, description="비밀번호")
          fullName: Optional[str] = Field(default=None, description="전체 이름")

      requestData = {
          "username": "alice",
          "email": "alice@example.com",
          "password": "secure123",
          "fullName": "Alice Smith"
      }
      createReq = CreateUserRequest.model_validate(requestData)
      createReq
    hints:
    - 바꿀 지점은 모델 필드 선언, 입력 dict, 생성 인자입니다.
    - 실행 뒤 model_dump(), 오류 메시지, 반환값이 바꾼 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 요청 모델에서 \`requestData\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 요청 모델 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: response
  title: 응답 모델
  structuredPrimary: true
  subtitle: Response Schema
  goal: 응답 모델에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: 응답 모델은 클라이언트에게 반환할 데이터 구조를 정의합니다. 요청 모델과 달리 ID, 생성일시 등 서버에서 생성하는 필드가 포함되고, 비밀번호 같은 민감 정보는
    제외됩니다. FastAPI는 응답 모델에 맞게 자동으로 JSON 직렬화합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    class UserResponse(BaseModel):
        userId: str = Field(description="사용자 고유 ID")
        username: str = Field(description="사용자명")
        email: str = Field(description="이메일")
        fullName: Optional[str] = Field(description="전체 이름")
        createdAt: datetime = Field(description="생성 시각")
        isActive: bool = Field(default=True, description="활성 상태")

    responseData = {
        "userId": "usr_123456",
        "username": "alice",
        "email": "alice@example.com",
        "fullName": "Alice Smith",
        "createdAt": "2024-03-15T10:30:00",
        "isActive": True
    }
    userResp = UserResponse.model_validate(responseData)
    userResp
  exercise:
    prompt: 응답 모델 예제에서 모델 필드나 입력 dict 값을 바꾸고 검증/직렬화 결과가 달라지는지 확인하세요.
    starterCode: |-
      class UserResponse(BaseModel):
          userId: str = Field(description="사용자 고유 ID")
          username: str = Field(description="사용자명")
          email: str = Field(description="이메일")
          fullName: Optional[str] = Field(description="전체 이름")
          createdAt: datetime = Field(description="생성 시각")
          isActive: bool = Field(default=True, description="활성 상태")

      responseData = {
          "userId": "usr_123456",
          "username": "alice",
          "email": "alice@example.com",
          "fullName": "Alice Smith",
          "createdAt": "2024-03-15T10:30:00",
          "isActive": True
      }
      userResp = UserResponse.model_validate(responseData)
      userResp
    hints:
    - 바꿀 지점은 모델 필드 선언, 입력 dict, 생성 인자입니다.
    - 실행 뒤 model_dump(), 오류 메시지, 반환값이 바꾼 입력을 반영하는지 보세요.
  check:
    noError: 응답 모델에서 \`responseData\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 응답 모델 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: crud
  title: CRUD 모델 세트
  structuredPrimary: true
  subtitle: 생성/읽기/수정 분리
  goal: CRUD 모델 세트에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.
  why: 데이터 계약은 외부 입력을 안전하게 처리하고 오류를 빠르게 드러내는 실무 기준입니다.
  explanation: 실무에서는 같은 리소스에 대해 생성, 읽기, 수정용 모델을 분리합니다. Base 모델에 공통 필드를 정의하고 상속하면 중복을 줄일 수 있습니다. Update
    모델은 모든 필드를 Optional로 하여 부분 수정(PATCH)을 지원합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    class ProductBase(BaseModel):
        name: str = Field(min_length=2, max_length=100)
        description: Optional[str] = Field(default=None, max_length=1000)
        price: float = Field(gt=0)
        category: str

    class ProductCreate(ProductBase):
        sku: str = Field(description="상품 코드")

    class ProductUpdate(BaseModel):
        name: Optional[str] = Field(default=None, min_length=2, max_length=100)
        description: Optional[str] = Field(default=None, max_length=1000)
        price: Optional[float] = Field(default=None, gt=0)
        category: Optional[str] = None

    class ProductResponse(ProductBase):
        productId: str
        sku: str
        createdAt: datetime
        updatedAt: Optional[datetime] = None
  exercise:
    prompt: CRUD 모델 세트 예제에서 모델 필드나 입력 dict 값을 바꾸고 검증/직렬화 결과가 달라지는지 확인하세요.
    starterCode: |-
      class ProductBase(BaseModel):
          name: str = Field(min_length=2, max_length=100)
          description: Optional[str] = Field(default=None, max_length=1000)
          price: float = Field(gt=0)
          category: str

      class ProductCreate(ProductBase):
          sku: str = Field(description="상품 코드")

      class ProductUpdate(BaseModel):
          name: Optional[str] = Field(default=None, min_length=2, max_length=100)
          description: Optional[str] = Field(default=None, max_length=1000)
          price: Optional[float] = Field(default=None, gt=0)
          category: Optional[str] = None

      class ProductResponse(ProductBase):
          productId: str
          sku: str
          createdAt: datetime
          updatedAt: Optional[datetime] = None
    hints:
    - 바꿀 지점은 모델 필드 선언, 입력 dict, 생성 인자입니다.
    - 실행 뒤 model_dump(), 오류 메시지, 반환값이 바꾼 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: CRUD 모델 세트의 시퀀스 접근이 IndexError 없이 실행되어야 합니다.
    resultCheck: CRUD 모델 세트 결과가 바꾼 리스트 값이나 인덱스 기준으로 달라져야 합니다.
- id: query
  title: 쿼리 파라미터
  structuredPrimary: true
  subtitle: 검색과 필터링
  goal: 쿼리 파라미터에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: FastAPI에서 쿼리 파라미터도 Pydantic 모델로 정의할 수 있습니다. 검색어, 필터, 정렬, 페이지네이션 등을 모델로 묶으면 검증과 기본값 처리가
    자동화됩니다. Literal로 정렬 옵션을 제한하면 API 문서에도 반영됩니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    class SearchParams(BaseModel):
        query: Optional[str] = Field(default=None, min_length=1, description="검색어")
        category: Optional[str] = Field(default=None, description="카테고리 필터")
        minPrice: Optional[float] = Field(default=None, ge=0, description="최소 가격")
        maxPrice: Optional[float] = Field(default=None, ge=0, description="최대 가격")
        sortBy: Literal["name", "price", "createdAt"] = Field(default="createdAt")
        sortOrder: Literal["asc", "desc"] = Field(default="desc")
        page: int = Field(default=1, ge=1)
        pageSize: int = Field(default=20, ge=1, le=100)

    searchParams = SearchParams(
        query="laptop",
        category="electronics",
        minPrice=500000,
        sortBy="price",
        sortOrder="asc"
    )
    searchParams.model_dump()
  exercise:
    prompt: 쿼리 파라미터 예제에서 모델 필드나 입력 dict 값을 바꾸고 검증/직렬화 결과가 달라지는지 확인하세요.
    starterCode: |-
      class SearchParams(BaseModel):
          query: Optional[str] = Field(default=None, min_length=1, description="검색어")
          category: Optional[str] = Field(default=None, description="카테고리 필터")
          minPrice: Optional[float] = Field(default=None, ge=0, description="최소 가격")
          maxPrice: Optional[float] = Field(default=None, ge=0, description="최대 가격")
          sortBy: Literal["name", "price", "createdAt"] = Field(default="createdAt")
          sortOrder: Literal["asc", "desc"] = Field(default="desc")
          page: int = Field(default=1, ge=1)
          pageSize: int = Field(default=20, ge=1, le=100)

      searchParams = SearchParams(
          query="laptop",
          category="electronics",
          minPrice=500000,
          sortBy="price",
          sortOrder="asc"
      )
      searchParams.model_dump()
    hints:
    - 바꿀 지점은 모델 필드 선언, 입력 dict, 생성 인자입니다.
    - 실행 뒤 model_dump(), 오류 메시지, 반환값이 바꾼 입력을 반영하는지 보세요.
  check:
    noError: 쿼리 파라미터에서 \`searchParams\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 쿼리 파라미터 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: pagination
  title: 페이지네이션 응답
  structuredPrimary: true
  subtitle: 목록 래퍼
  goal: 페이지네이션 응답에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: 목록 API는 데이터와 함께 페이지네이션 정보를 반환해야 합니다. Generic을 사용하면 어떤 타입의 목록이든 감쌀 수 있는 재사용 가능한 래퍼 모델을 만들
    수 있습니다. 전체 개수, 현재 페이지, 다음/이전 페이지 존재 여부 등을 포함합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    T = TypeVar('T')

    class PaginatedResponse(BaseModel, Generic[T]):
        items: list[T] = Field(description="데이터 목록")
        total: int = Field(description="전체 개수")
        page: int = Field(description="현재 페이지")
        pageSize: int = Field(description="페이지 크기")
        totalPages: int = Field(description="전체 페이지 수")
        hasNext: bool = Field(description="다음 페이지 존재")
        hasPrev: bool = Field(description="이전 페이지 존재")

    class SimpleProduct(BaseModel):
        productId: str
        name: str
        price: float

    sampleProducts = [
        SimpleProduct(productId="P1", name="Product A", price=100),
        SimpleProduct(productId="P2", name="Product B", price=200)
    ]

    paginatedResp = PaginatedResponse[SimpleProduct](
        items=sampleProducts,
        total=50,
        page=1,
        pageSize=20,
        totalPages=3,
        hasNext=True,
        hasPrev=False
    )
    paginatedResp.model_dump()
  exercise:
    prompt: 페이지네이션 응답 예제에서 모델 필드나 입력 dict 값을 바꾸고 검증/직렬화 결과가 달라지는지 확인하세요.
    starterCode: |-
      T = TypeVar('T')

      class PaginatedResponse(BaseModel, Generic[T]):
          items: list[T] = Field(description="데이터 목록")
          total: int = Field(description="전체 개수")
          page: int = Field(description="현재 페이지")
          pageSize: int = Field(description="페이지 크기")
          totalPages: int = Field(description="전체 페이지 수")
          hasNext: bool = Field(description="다음 페이지 존재")
          hasPrev: bool = Field(description="이전 페이지 존재")

      class SimpleProduct(BaseModel):
          productId: str
          name: str
          price: float

      sampleProducts = [
          SimpleProduct(productId="P1", name="Product A", price=100),
          SimpleProduct(productId="P2", name="Product B", price=200)
      ]

      paginatedResp = PaginatedResponse[SimpleProduct](
          items=sampleProducts,
          total=50,
          page=1,
          pageSize=20,
          totalPages=3,
          hasNext=True,
          hasPrev=False
      )
      paginatedResp.model_dump()
    hints:
    - 바꿀 지점은 모델 필드 선언, 입력 dict, 생성 인자입니다.
    - 실행 뒤 model_dump(), 오류 메시지, 반환값이 바꾼 입력을 반영하는지 보세요.
  check:
    noError: 페이지네이션 응답에서 \`T\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 페이지네이션 응답 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: error
  title: 에러 응답
  structuredPrimary: true
  subtitle: 표준 에러 형식
  goal: 에러 응답에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: API 에러 응답도 일관된 형식으로 정의합니다. 에러 코드, 메시지, 상세 정보를 포함하면 클라이언트가 에러를 적절히 처리할 수 있습니다. FastAPI의
    HTTPException과 함께 사용하면 표준화된 에러 응답을 반환할 수 있습니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    class ErrorDetail(BaseModel):
        field: str = Field(description="에러 필드")
        message: str = Field(description="에러 메시지")
        code: str = Field(description="에러 코드")

    class ErrorResponse(BaseModel):
        success: bool = False
        error: str = Field(description="에러 타입")
        message: str = Field(description="에러 설명")
        details: list[ErrorDetail] = Field(default=[], description="상세 에러")
        timestamp: datetime = Field(default_factory=datetime.now)

    errorResp = ErrorResponse(
        error="VALIDATION_ERROR",
        message="입력 데이터 검증 실패",
        details=[
            ErrorDetail(field="email", message="유효한 이메일 형식이 아닙니다", code="invalid_format"),
            ErrorDetail(field="password", message="8자 이상이어야 합니다", code="too_short")
        ]
    )
    errorResp.model_dump_json(indent=2)
  exercise:
    prompt: 에러 응답 예제에서 모델 필드나 입력 dict 값을 바꾸고 검증/직렬화 결과가 달라지는지 확인하세요.
    starterCode: |-
      class ErrorDetail(BaseModel):
          field: str = Field(description="에러 필드")
          message: str = Field(description="에러 메시지")
          code: str = Field(description="에러 코드")

      class ErrorResponse(BaseModel):
          success: bool = False
          error: str = Field(description="에러 타입")
          message: str = Field(description="에러 설명")
          details: list[ErrorDetail] = Field(default=[], description="상세 에러")
          timestamp: datetime = Field(default_factory=datetime.now)

      errorResp = ErrorResponse(
          error="VALIDATION_ERROR",
          message="입력 데이터 검증 실패",
          details=[
              ErrorDetail(field="email", message="유효한 이메일 형식이 아닙니다", code="invalid_format"),
              ErrorDetail(field="password", message="8자 이상이어야 합니다", code="too_short")
          ]
      )
      errorResp.model_dump_json(indent=2)
    hints:
    - 바꿀 지점은 모델 필드 선언, 입력 dict, 생성 인자입니다.
    - 실행 뒤 model_dump(), 오류 메시지, 반환값이 바꾼 입력을 반영하는지 보세요.
  check:
    noError: 에러 응답에서 \`errorResp\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 에러 응답 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: nested
  title: 중첩 API 모델
  structuredPrimary: true
  subtitle: 복잡한 요청/응답
  goal: 중첩 API 모델에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: 실제 API는 중첩된 복잡한 구조를 가집니다. 주문 생성 요청에는 여러 상품, 배송지, 결제 정보가 포함됩니다. 이런 중첩 구조도 Pydantic 모델로 정의하면
    전체가 자동으로 검증됩니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    class OrderItemRequest(BaseModel):
        productId: str
        quantity: int = Field(ge=1)
        note: Optional[str] = None

    class ShippingAddress(BaseModel):
        recipientName: str
        phone: str
        address: str
        zipCode: str

    class CreateOrderRequest(BaseModel):
        items: list[OrderItemRequest] = Field(min_length=1)
        shippingAddress: ShippingAddress
        paymentMethod: Literal["card", "bank", "cash"]
        couponCode: Optional[str] = None

    orderRequest = CreateOrderRequest(
        items=[
            {"productId": "P001", "quantity": 2},
            {"productId": "P002", "quantity": 1, "note": "선물포장"}
        ],
        shippingAddress={
            "recipientName": "홍길동",
            "phone": "010-1234-5678",
            "address": "서울시 강남구 테헤란로 123",
            "zipCode": "06234"
        },
        paymentMethod="card"
    )
    orderRequest.model_dump()
  exercise:
    prompt: 중첩 API 모델 예제에서 모델 필드나 입력 dict 값을 바꾸고 검증/직렬화 결과가 달라지는지 확인하세요.
    starterCode: |-
      class OrderItemRequest(BaseModel):
          productId: str
          quantity: int = Field(ge=1)
          note: Optional[str] = None

      class ShippingAddress(BaseModel):
          recipientName: str
          phone: str
          address: str
          zipCode: str

      class CreateOrderRequest(BaseModel):
          items: list[OrderItemRequest] = Field(min_length=1)
          shippingAddress: ShippingAddress
          paymentMethod: Literal["card", "bank", "cash"]
          couponCode: Optional[str] = None

      orderRequest = CreateOrderRequest(
          items=[
              {"productId": "P001", "quantity": 2},
              {"productId": "P002", "quantity": 1, "note": "선물포장"}
          ],
          shippingAddress={
              "recipientName": "홍길동",
              "phone": "010-1234-5678",
              "address": "서울시 강남구 테헤란로 123",
              "zipCode": "06234"
          },
          paymentMethod="card"
      )
      orderRequest.model_dump()
    hints:
    - 바꿀 지점은 모델 필드 선언, 입력 dict, 생성 인자입니다.
    - 실행 뒤 model_dump(), 오류 메시지, 반환값이 바꾼 입력을 반영하는지 보세요.
  check:
    noError: 중첩 API 모델에서 \`orderRequest\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 중첩 API 모델 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: filter
  title: 응답 필터링
  structuredPrimary: true
  subtitle: include/exclude
  goal: 응답 필터링에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: 상황에 따라 응답에서 특정 필드만 포함하거나 제외해야 할 때가 있습니다. 공개 프로필은 최소 정보만, 관리자 뷰는 전체 정보를 반환하는 식입니다. model_dump의
    include/exclude 옵션으로 유연하게 제어할 수 있습니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    class FullUserProfile(BaseModel):
        userId: str
        username: str
        email: str
        phone: str
        address: str
        birthDate: str
        createdAt: datetime
        lastLoginAt: Optional[datetime] = None
        isAdmin: bool = False

    fullProfile = FullUserProfile(
        userId="U001",
        username="alice",
        email="alice@example.com",
        phone="010-1234-5678",
        address="서울시 강남구",
        birthDate="1990-01-15",
        createdAt="2024-01-01T00:00:00",
        lastLoginAt="2024-03-15T10:30:00",
        isAdmin=False
    )

    publicView = fullProfile.model_dump(include={"userId", "username"})
    basicView = fullProfile.model_dump(include={"userId", "username", "email", "createdAt"})
    publicView, basicView
  exercise:
    prompt: 응답 필터링 예제에서 모델 필드나 입력 dict 값을 바꾸고 검증/직렬화 결과가 달라지는지 확인하세요.
    starterCode: |-
      class FullUserProfile(BaseModel):
          userId: str
          username: str
          email: str
          phone: str
          address: str
          birthDate: str
          createdAt: datetime
          lastLoginAt: Optional[datetime] = None
          isAdmin: bool = False

      fullProfile = FullUserProfile(
          userId="U001",
          username="alice",
          email="alice@example.com",
          phone="010-1234-5678",
          address="서울시 강남구",
          birthDate="1990-01-15",
          createdAt="2024-01-01T00:00:00",
          lastLoginAt="2024-03-15T10:30:00",
          isAdmin=False
      )

      publicView = fullProfile.model_dump(include={"userId", "username"})
      basicView = fullProfile.model_dump(include={"userId", "username", "email", "createdAt"})
      publicView, basicView
    hints:
    - 바꿀 지점은 모델 필드 선언, 입력 dict, 생성 인자입니다.
    - 실행 뒤 model_dump(), 오류 메시지, 반환값이 바꾼 입력을 반영하는지 보세요.
  check:
    noError: 응답 필터링에서 \`fullProfile\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 응답 필터링 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: computed
  title: 계산 필드 응답
  structuredPrimary: true
  subtitle: computed_field
  goal: 계산 필드 응답에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: 응답에 계산된 값을 포함하려면 computed_field를 사용합니다. 장바구니 총액, 주문 상태 텍스트, 사용자 등급 등 다른 필드에서 계산되는 값을 자동으로
    직렬화에 포함시킬 수 있습니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    class CartItem(BaseModel):
        productId: str
        productName: str
        unitPrice: float
        quantity: int

        @computed_field
        @property
        def subtotal(self) -> float:
            return self.unitPrice * self.quantity

    class CartResponse(BaseModel):
        cartId: str
        items: list[CartItem]

        @computed_field
        @property
        def totalAmount(self) -> float:
            return sum(item.subtotal for item in self.items)

        @computed_field
        @property
        def itemCount(self) -> int:
            return sum(item.quantity for item in self.items)

    cart = CartResponse(
        cartId="CART-001",
        items=[
            CartItem(productId="P1", productName="노트북", unitPrice=1000000, quantity=1),
            CartItem(productId="P2", productName="마우스", unitPrice=50000, quantity=2)
        ]
    )
    cart.model_dump()
  exercise:
    prompt: 계산 필드 응답 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      class CartItem(BaseModel):
          productId: str
          productName: str
          unitPrice: float
          quantity: int

          @computed_field
          @property
          def subtotal(self) -> float:
              return self.unitPrice * self.quantity

      class CartResponse(BaseModel):
          cartId: str
          items: list[CartItem]

          @computed_field
          @property
          def totalAmount(self) -> float:
              return sum(item.subtotal for item in self.items)

          @computed_field
          @property
          def itemCount(self) -> int:
              return sum(item.quantity for item in self.items)

      cart = CartResponse(
          cartId="CART-001",
          items=[
              CartItem(productId="P1", productName="노트북", unitPrice=1000000, quantity=1),
              CartItem(productId="P2", productName="마우스", unitPrice=50000, quantity=2)
          ]
      )
      cart.model_dump()
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    noError: 계산 필드 응답의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 계산 필드 응답 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: result
  title: 완전한 API 모델 세트
  structuredPrimary: true
  subtitle: 종합 설계
  goal: 완전한 API 모델 세트에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: 지금까지 배운 모든 패턴을 종합하여 실제 서비스에서 사용할 수 있는 완전한 API 모델 세트를 완성합니다. 성공/실패 응답 래퍼, 상태 Enum, 중첩 모델까지
    모두 포함합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    class ApiResponse(BaseModel, Generic[T]):
        success: bool = True
        data: T
        timestamp: datetime = Field(default_factory=datetime.now)

    successResp = ApiResponse[UserResponse](data=userResp)
    successResp.model_dump_json(indent=2)[:300]
  exercise:
    prompt: 완전한 API 모델 세트 예제에서 모델 필드나 입력 dict 값을 바꾸고 검증/직렬화 결과가 달라지는지 확인하세요.
    starterCode: |-
      class ApiResponse(BaseModel, Generic[T]):
          success: bool = True
          data: T
          timestamp: datetime = Field(default_factory=datetime.now)

      successResp = ApiResponse[UserResponse](data=userResp)
      successResp.model_dump_json(indent=2)[:300]
    hints:
    - 바꿀 지점은 모델 필드 선언, 입력 dict, 생성 인자입니다.
    - 실행 뒤 model_dump(), 오류 메시지, 반환값이 바꾼 입력을 반영하는지 보세요.
  check:
    noError: 완전한 API 모델 세트에서 \`successResp\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 완전한 API 모델 세트 실행 뒤 \`successResp\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.
- id: practice
  title: 실습
  structuredPrimary: true
  subtitle: API 모델 프로젝트
  goal: 실습에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: |-
    지금까지 배운 요청/응답 모델, CRUD 패턴, 페이지네이션, 에러 응답, computed_field를 활용하여 완전한 API 모델을 설계합니다.

    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.
  snippet: |-
    from pydantic import BaseModel, Field, computed_field
    from typing import Optional, Literal
    from datetime import datetime

    class AuthorInfo(BaseModel):
        authorId: str
        name: str
        avatarUrl: Optional[str] = None

    class PostBase(BaseModel):
        title: str = Field(min_length=1, max_length=200)
        content: str = Field(min_length=10)
        tags: list[str] = Field(default=[])

    class CreatePostRequest(PostBase):
        status: Literal["draft", "published"] = "draft"

    class UpdatePostRequest(BaseModel):
        title: Optional[str] = Field(default=None, min_length=1, max_length=200)
        content: Optional[str] = Field(default=None, min_length=10)
        tags: Optional[list[str]] = None
        status: Optional[Literal["draft", "published"]] = None

    class PostResponse(PostBase):
        postId: str
        author: AuthorInfo
        status: str
        viewCount: int = 0
        likeCount: int = 0
        createdAt: datetime
        updatedAt: Optional[datetime] = None

        @computed_field
        @property
        def isPublished(self) -> bool:
            return self.status == "published"

    createReq = CreatePostRequest(
        title="Pydantic 가이드",
        content="Pydantic은 Python 데이터 검증 라이브러리입니다...",
        tags=["python", "pydantic"],
        status="published"
    )
    createReq.model_dump()
  exercise:
    prompt: 실습 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      from pydantic import BaseModel, Field, computed_field
      from typing import Optional, Literal
      from datetime import datetime

      class AuthorInfo(BaseModel):
          authorId: str
          name: str
          avatarUrl: Optional[str] = None

      class PostBase(BaseModel):
          title: str = Field(min_length=1, max_length=200)
          content: str = Field(min_length=10)
          tags: list[str] = Field(default=[])

      class CreatePostRequest(PostBase):
          status: Literal["draft", "published"] = "draft"

      class UpdatePostRequest(BaseModel):
          title: Optional[str] = Field(default=None, min_length=1, max_length=200)
          content: Optional[str] = Field(default=None, min_length=10)
          tags: Optional[list[str]] = None
          status: Optional[Literal["draft", "published"]] = None

      class PostResponse(PostBase):
          postId: str
          author: AuthorInfo
          status: str
          viewCount: int = 0
          likeCount: int = 0
          createdAt: datetime
          updatedAt: Optional[datetime] = None

          @computed_field
          @property
          def isPublished(self) -> bool:
              return self.status == "published"

      createReq = CreatePostRequest(
          title="Pydantic 가이드",
          content="Pydantic은 Python 데이터 검증 라이브러리입니다...",
          tags=["python", "pydantic"],
          status="published"
      )
      createReq.model_dump()
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
  - id: pydantic_09-request-response-contract-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - load
    - workflow_validation
    title: API 요청과 응답 model 계약을 함께 검증하기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: 요청 field를 검증해 계산한 응답이 선언된 key·type을 만족하는지 확인한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 요청 오류와 서버 내부 오류를 다른 status로 표현하세요.
    - 응답 model도 key와 type을 검증해야 합니다.
    exercise:
      prompt: handle_create_request(payload)를 완성해 status와 body를 반환하세요.
      starterCode: |-
        def handle_create_request(payload):
            raise NotImplementedError
      solution: |
        def handle_create_request(payload):
            name = str(payload.get("name", "")).strip()
            quantity = payload.get("quantity")
            if not name or not isinstance(quantity, int) or isinstance(quantity, bool) or quantity < 1:
                return {"status": 422, "body": {"error": "invalid request"}}
            body = {"id": f"item-{name.lower().replace(' ', '-')}", "name": name, "quantity": quantity}
            if set(body) != {"id", "name", "quantity"}:
                raise AssertionError("response contract drift")
            return {"status": 201, "body": body}
      hints: *id001
    check:
      id: python.pydantic.pydantic_09.request-response-contract.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.pydantic.pydantic_09.request-response-contract.mastery.behavior.v1.fixture
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
        entry: handle_create_request
        cases:
        - id: returns-created-response
          arguments:
          - value:
              name: ' Paper Clip '
              quantity: 3
          expectedReturn:
            status: 201
            body:
              id: item-paper-clip
              name: Paper Clip
              quantity: 3
        - id: returns-validation-error
          arguments:
          - value:
              name: ''
              quantity: 0
          expectedReturn:
            status: 422
            body:
              error: invalid request
        - id: rejects-bool-quantity
          arguments:
          - value:
              name: Box
              quantity: true
          expectedReturn:
            status: 422
            body:
              error: invalid request
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: pydantic_09-domain-error-status-map-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - pydantic_09-request-response-contract-mastery
    title: 새 domain 오류를 안정된 HTTP 응답으로 매핑하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: validation 개념을 not-found·conflict·permission 오류와 status/body 계약으로 전이한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - domain 오류 이름과 HTTP status 매핑을 한 곳에 고정하세요.
    - 내부 stack trace 대신 안정된 body 계약을 반환하세요.
    exercise:
      prompt: map_domain_error(error_type, resource)를 완성해 status와 body를 반환하세요.
      starterCode: |-
        def map_domain_error(error_type, resource):
            raise NotImplementedError
      solution: |
        def map_domain_error(error_type, resource):
            table = {
                "not-found": (404, "resource not found"),
                "conflict": (409, "resource conflict"),
                "permission": (403, "permission denied"),
                "validation": (422, "invalid request"),
            }
            if error_type not in table:
                raise ValueError("unknown domain error")
            status, message = table[error_type]
            return {"status": status, "body": {"error": error_type, "message": message, "resource": resource}}
      hints: *id002
    check:
      id: python.pydantic.pydantic_09.domain-error-status-map.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.pydantic.pydantic_09.domain-error-status-map.transfer.behavior.v1.fixture
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
        entry: map_domain_error
        cases:
        - id: maps-conflict
          arguments:
          - value: conflict
          - value: order/O-1
          expectedReturn:
            status: 409
            body:
              error: conflict
              message: resource conflict
              resource: order/O-1
        - id: maps-permission
          arguments:
          - value: permission
          - value: report/R-2
          expectedReturn:
            status: 403
            body:
              error: permission
              message: permission denied
              resource: report/R-2
        - id: rejects-unknown-error
          arguments:
          - value: oops
          - value: x
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: pydantic_09-api-model-boundary-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - pydantic_09-domain-error-status-map-transfer
    title: FastAPI model이 맡을 경계 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: request parsing, domain logic, response serialization 책임을 구분한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - model validation과 business rule을 같은 책임으로 섞지 마세요.
    - 응답도 외부 경계이므로 명시적 schema가 필요합니다.
    exercise:
      prompt: choose_api_boundary(situation)를 완성해 owner, evidence, forbidden을 반환하세요.
      starterCode: |-
        def choose_api_boundary(situation):
            raise NotImplementedError
      solution: |
        def choose_api_boundary(situation):
            table = {'request-shape': {'owner': 'request model', 'evidence': '422 field paths', 'forbidden': 'run domain action first'}, 'business-rule': {'owner': 'domain service', 'evidence': 'typed domain result', 'forbidden': 'hide in serializer'}, 'response-shape': {'owner': 'response model', 'evidence': 'serialized contract', 'forbidden': 'return arbitrary object'}}
            if situation not in table:
                raise ValueError('unknown situation')
            return table[situation]
      hints: *id003
    check:
      id: python.pydantic.pydantic_09.api-model-boundary.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.pydantic.pydantic_09.api-model-boundary.retrieval.behavior.v1.fixture
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
        entry: choose_api_boundary
        cases:
        - id: recalls-request-shape
          arguments:
          - value: request-shape
          expectedReturn:
            owner: request model
            evidence: 422 field paths
            forbidden: run domain action first
        - id: recalls-business-rule
          arguments:
          - value: business-rule
          expectedReturn:
            owner: domain service
            evidence: typed domain result
            forbidden: hide in serializer
        - id: rejects-unknown-situation
          arguments:
          - value: unknown
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};