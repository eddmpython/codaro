var e=`meta:\r
  packages:\r
  - pydantic\r
  id: pydantic_09\r
  title: FastAPI통합\r
  order: 9\r
  category: pydantic\r
  difficulty: ⭐⭐⭐⭐\r
  badge: 고급\r
  tags:\r
  - pydantic\r
  - FastAPI\r
  - API\r
  - 웹개발\r
  - 스키마\r
  seo:\r
    title: Pydantic과 FastAPI - 웹 API 개발\r
    description: Pydantic 모델을 FastAPI와 통합합니다. 요청/응답 스키마, 자동 문서화, 검증을 배웁니다.\r
    keywords:\r
    - pydantic\r
    - FastAPI\r
    - API\r
    - 웹개발\r
intro:\r
  emoji: ⚡\r
  goal: Pydantic 모델로 완전한 REST API 모델 세트를 설계합니다.\r
  description: FastAPI는 Pydantic을 핵심 검증 엔진으로 사용하는 현대적인 웹 프레임워크입니다. 요청 본문, 응답 스키마, 쿼리 파라미터를 모두 Pydantic\r
    모델로 정의하면 자동 검증, 타입 변환, API 문서화까지 한번에 해결됩니다. 이 프로젝트에서는 실제 API에서 사용하는 CRUD 모델 패턴을 설계합니다.\r
  direction: FastAPI통합에서 입력 스키마를 정의하고 검증된 데이터만 처리 흐름에 넘김합니다.\r
  benefits:\r
  - 외부 입력 확인 후 스키마 검증에 맞는 코드 입력을 고릅니다.\r
  - FastAPI통합 결과를 성공 모델과 오류 메시지 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 API/자동화 입력 계약에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 라이브러리 로드 입력 확인\r
      detail: 입력 기준(외부 입력)과 필요한 조건을 먼저 고정합니다.\r
    - label: 요청 모델 처리 실행\r
      detail: 스키마 검증 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 응답 모델 결과 검증\r
      detail: 성공 모델과 오류 메시지 기준으로 실행 결과를 비교합니다.\r
    - label: FastAPI통합 재사용\r
      detail: 완성 코드를 API/자동화 입력 계약에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 데이터 계약 환경\r
      detail: pydantic 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: FastAPI통합 실행\r
      detail: 셀을 실행해 성공 모델과 오류 메시지와 예외 상태를 확인합니다.\r
    - label: FastAPI통합 완료\r
      detail: 검증된 코드를 API/자동화 입력 계약로 남깁니다.\r
sections:\r
- id: load\r
  title: 라이브러리 로드\r
  structuredPrimary: true\r
  subtitle: Pydantic import 확인\r
  goal: 라이브러리 로드에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: import 준비가 정확해야 다음 셀과 자동화 코드에서 같은 이름을 안정적으로 재사용할 수 있습니다.\r
  explanation: FastAPI는 Codaro 로컬 Python 환경에서 직접 실행하기 어렵지만, Pydantic 모델 설계는 동일합니다. FastAPI에서 요청 본문은 BaseModel로\r
    정의하고, 응답도 BaseModel로 정의하여 자동 직렬화와 OpenAPI 문서 생성이 가능합니다. 이 패턴을 익히면 실제 FastAPI 프로젝트에 바로 적용할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import pydantic\r
    from typing import Optional, List\r
    from pydantic import BaseModel, Field, ValidationError\r
  exercise:\r
    prompt: 라이브러리 로드 예제에서 import한 모듈의 별칭이나 바로 이어지는 확인 호출을 바꿔 준비 상태를 확인하세요.\r
    starterCode: |-\r
      import pydantic\r
      from typing import Optional, List\r
      from pydantic import BaseModel, Field, ValidationError\r
    hints:\r
    - 바꿀 지점은 외부 입력을 만드는 첫 줄과 스키마 검증 줄에서 찾으세요.\r
    - 실행 뒤 성공 모델과 오류 메시지 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 라이브러리 로드의 import 대상 모듈과 별칭이 현재 로컬 환경에서 준비되어야 합니다.\r
    resultCheck: 라이브러리 로드 실행 결과가 성공 모델과 오류 메시지 기준으로 바꾼 입력값을 반영해야 합니다.\r
- id: request\r
  title: 요청 모델\r
  structuredPrimary: true\r
  subtitle: Request Body\r
  goal: 요청 모델에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    요청 본문을 Pydantic 모델로 정의하면 FastAPI가 자동으로 JSON을 파싱하고 검증합니다. 잘못된 데이터가 들어오면 422 Unprocessable Entity 응답이 자동으로 반환됩니다. 모델에 Field를 사용하면 OpenAPI 문서에 설명과 예시가 포함됩니다.\r
\r
    요청 모델에는 password처럼 민감한 정보가 포함될 수 있습니다. 응답 모델에서는 이를 제외해야 합니다.\r
  snippet: |-\r
    class CreateUserRequest(BaseModel):\r
        username: str = Field(min_length=3, max_length=50, description="사용자명")\r
        email: str = Field(description="이메일 주소")\r
        password: str = Field(min_length=8, description="비밀번호")\r
        fullName: Optional[str] = Field(default=None, description="전체 이름")\r
\r
    requestData = {\r
        "username": "alice",\r
        "email": "alice@example.com",\r
        "password": "secure123",\r
        "fullName": "Alice Smith"\r
    }\r
    createReq = CreateUserRequest.model_validate(requestData)\r
    createReq\r
  exercise:\r
    prompt: 요청 모델 예제에서 모델 필드나 입력 dict 값을 바꾸고 검증/직렬화 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      class CreateUserRequest(BaseModel):\r
          username: str = Field(min_length=3, max_length=50, description="사용자명")\r
          email: str = Field(description="이메일 주소")\r
          password: str = Field(min_length=8, description="비밀번호")\r
          fullName: Optional[str] = Field(default=None, description="전체 이름")\r
\r
      requestData = {\r
          "username": "alice",\r
          "email": "alice@example.com",\r
          "password": "secure123",\r
          "fullName": "Alice Smith"\r
      }\r
      createReq = CreateUserRequest.model_validate(requestData)\r
      createReq\r
    hints:\r
    - 바꿀 지점은 모델 필드 선언, 입력 dict, 생성 인자입니다.\r
    - 실행 뒤 model_dump(), 오류 메시지, 반환값이 바꾼 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 요청 모델에서 \`requestData\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 요청 모델 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: response\r
  title: 응답 모델\r
  structuredPrimary: true\r
  subtitle: Response Schema\r
  goal: 응답 모델에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 응답 모델은 클라이언트에게 반환할 데이터 구조를 정의합니다. 요청 모델과 달리 ID, 생성일시 등 서버에서 생성하는 필드가 포함되고, 비밀번호 같은 민감 정보는\r
    제외됩니다. FastAPI는 응답 모델에 맞게 자동으로 JSON 직렬화합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    class UserResponse(BaseModel):\r
        userId: str = Field(description="사용자 고유 ID")\r
        username: str = Field(description="사용자명")\r
        email: str = Field(description="이메일")\r
        fullName: Optional[str] = Field(description="전체 이름")\r
        createdAt: datetime = Field(description="생성 시각")\r
        isActive: bool = Field(default=True, description="활성 상태")\r
\r
    responseData = {\r
        "userId": "usr_123456",\r
        "username": "alice",\r
        "email": "alice@example.com",\r
        "fullName": "Alice Smith",\r
        "createdAt": "2024-03-15T10:30:00",\r
        "isActive": True\r
    }\r
    userResp = UserResponse.model_validate(responseData)\r
    userResp\r
  exercise:\r
    prompt: 응답 모델 예제에서 모델 필드나 입력 dict 값을 바꾸고 검증/직렬화 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      class UserResponse(BaseModel):\r
          userId: str = Field(description="사용자 고유 ID")\r
          username: str = Field(description="사용자명")\r
          email: str = Field(description="이메일")\r
          fullName: Optional[str] = Field(description="전체 이름")\r
          createdAt: datetime = Field(description="생성 시각")\r
          isActive: bool = Field(default=True, description="활성 상태")\r
\r
      responseData = {\r
          "userId": "usr_123456",\r
          "username": "alice",\r
          "email": "alice@example.com",\r
          "fullName": "Alice Smith",\r
          "createdAt": "2024-03-15T10:30:00",\r
          "isActive": True\r
      }\r
      userResp = UserResponse.model_validate(responseData)\r
      userResp\r
    hints:\r
    - 바꿀 지점은 모델 필드 선언, 입력 dict, 생성 인자입니다.\r
    - 실행 뒤 model_dump(), 오류 메시지, 반환값이 바꾼 입력을 반영하는지 보세요.\r
  check:\r
    noError: 응답 모델에서 \`responseData\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 응답 모델 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: crud\r
  title: CRUD 모델 세트\r
  structuredPrimary: true\r
  subtitle: 생성/읽기/수정 분리\r
  goal: CRUD 모델 세트에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 데이터 계약은 외부 입력을 안전하게 처리하고 오류를 빠르게 드러내는 실무 기준입니다.\r
  explanation: 실무에서는 같은 리소스에 대해 생성, 읽기, 수정용 모델을 분리합니다. Base 모델에 공통 필드를 정의하고 상속하면 중복을 줄일 수 있습니다. Update\r
    모델은 모든 필드를 Optional로 하여 부분 수정(PATCH)을 지원합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    class ProductBase(BaseModel):\r
        name: str = Field(min_length=2, max_length=100)\r
        description: Optional[str] = Field(default=None, max_length=1000)\r
        price: float = Field(gt=0)\r
        category: str\r
\r
    class ProductCreate(ProductBase):\r
        sku: str = Field(description="상품 코드")\r
\r
    class ProductUpdate(BaseModel):\r
        name: Optional[str] = Field(default=None, min_length=2, max_length=100)\r
        description: Optional[str] = Field(default=None, max_length=1000)\r
        price: Optional[float] = Field(default=None, gt=0)\r
        category: Optional[str] = None\r
\r
    class ProductResponse(ProductBase):\r
        productId: str\r
        sku: str\r
        createdAt: datetime\r
        updatedAt: Optional[datetime] = None\r
  exercise:\r
    prompt: CRUD 모델 세트 예제에서 모델 필드나 입력 dict 값을 바꾸고 검증/직렬화 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      class ProductBase(BaseModel):\r
          name: str = Field(min_length=2, max_length=100)\r
          description: Optional[str] = Field(default=None, max_length=1000)\r
          price: float = Field(gt=0)\r
          category: str\r
\r
      class ProductCreate(ProductBase):\r
          sku: str = Field(description="상품 코드")\r
\r
      class ProductUpdate(BaseModel):\r
          name: Optional[str] = Field(default=None, min_length=2, max_length=100)\r
          description: Optional[str] = Field(default=None, max_length=1000)\r
          price: Optional[float] = Field(default=None, gt=0)\r
          category: Optional[str] = None\r
\r
      class ProductResponse(ProductBase):\r
          productId: str\r
          sku: str\r
          createdAt: datetime\r
          updatedAt: Optional[datetime] = None\r
    hints:\r
    - 바꿀 지점은 모델 필드 선언, 입력 dict, 생성 인자입니다.\r
    - 실행 뒤 model_dump(), 오류 메시지, 반환값이 바꾼 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: CRUD 모델 세트의 시퀀스 접근이 IndexError 없이 실행되어야 합니다.\r
    resultCheck: CRUD 모델 세트 결과가 바꾼 리스트 값이나 인덱스 기준으로 달라져야 합니다.\r
- id: query\r
  title: 쿼리 파라미터\r
  structuredPrimary: true\r
  subtitle: 검색과 필터링\r
  goal: 쿼리 파라미터에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: FastAPI에서 쿼리 파라미터도 Pydantic 모델로 정의할 수 있습니다. 검색어, 필터, 정렬, 페이지네이션 등을 모델로 묶으면 검증과 기본값 처리가\r
    자동화됩니다. Literal로 정렬 옵션을 제한하면 API 문서에도 반영됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    class SearchParams(BaseModel):\r
        query: Optional[str] = Field(default=None, min_length=1, description="검색어")\r
        category: Optional[str] = Field(default=None, description="카테고리 필터")\r
        minPrice: Optional[float] = Field(default=None, ge=0, description="최소 가격")\r
        maxPrice: Optional[float] = Field(default=None, ge=0, description="최대 가격")\r
        sortBy: Literal["name", "price", "createdAt"] = Field(default="createdAt")\r
        sortOrder: Literal["asc", "desc"] = Field(default="desc")\r
        page: int = Field(default=1, ge=1)\r
        pageSize: int = Field(default=20, ge=1, le=100)\r
\r
    searchParams = SearchParams(\r
        query="laptop",\r
        category="electronics",\r
        minPrice=500000,\r
        sortBy="price",\r
        sortOrder="asc"\r
    )\r
    searchParams.model_dump()\r
  exercise:\r
    prompt: 쿼리 파라미터 예제에서 모델 필드나 입력 dict 값을 바꾸고 검증/직렬화 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      class SearchParams(BaseModel):\r
          query: Optional[str] = Field(default=None, min_length=1, description="검색어")\r
          category: Optional[str] = Field(default=None, description="카테고리 필터")\r
          minPrice: Optional[float] = Field(default=None, ge=0, description="최소 가격")\r
          maxPrice: Optional[float] = Field(default=None, ge=0, description="최대 가격")\r
          sortBy: Literal["name", "price", "createdAt"] = Field(default="createdAt")\r
          sortOrder: Literal["asc", "desc"] = Field(default="desc")\r
          page: int = Field(default=1, ge=1)\r
          pageSize: int = Field(default=20, ge=1, le=100)\r
\r
      searchParams = SearchParams(\r
          query="laptop",\r
          category="electronics",\r
          minPrice=500000,\r
          sortBy="price",\r
          sortOrder="asc"\r
      )\r
      searchParams.model_dump()\r
    hints:\r
    - 바꿀 지점은 모델 필드 선언, 입력 dict, 생성 인자입니다.\r
    - 실행 뒤 model_dump(), 오류 메시지, 반환값이 바꾼 입력을 반영하는지 보세요.\r
  check:\r
    noError: 쿼리 파라미터에서 \`searchParams\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 쿼리 파라미터 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: pagination\r
  title: 페이지네이션 응답\r
  structuredPrimary: true\r
  subtitle: 목록 래퍼\r
  goal: 페이지네이션 응답에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 목록 API는 데이터와 함께 페이지네이션 정보를 반환해야 합니다. Generic을 사용하면 어떤 타입의 목록이든 감쌀 수 있는 재사용 가능한 래퍼 모델을 만들\r
    수 있습니다. 전체 개수, 현재 페이지, 다음/이전 페이지 존재 여부 등을 포함합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    T = TypeVar('T')\r
\r
    class PaginatedResponse(BaseModel, Generic[T]):\r
        items: list[T] = Field(description="데이터 목록")\r
        total: int = Field(description="전체 개수")\r
        page: int = Field(description="현재 페이지")\r
        pageSize: int = Field(description="페이지 크기")\r
        totalPages: int = Field(description="전체 페이지 수")\r
        hasNext: bool = Field(description="다음 페이지 존재")\r
        hasPrev: bool = Field(description="이전 페이지 존재")\r
\r
    class SimpleProduct(BaseModel):\r
        productId: str\r
        name: str\r
        price: float\r
\r
    sampleProducts = [\r
        SimpleProduct(productId="P1", name="Product A", price=100),\r
        SimpleProduct(productId="P2", name="Product B", price=200)\r
    ]\r
\r
    paginatedResp = PaginatedResponse[SimpleProduct](\r
        items=sampleProducts,\r
        total=50,\r
        page=1,\r
        pageSize=20,\r
        totalPages=3,\r
        hasNext=True,\r
        hasPrev=False\r
    )\r
    paginatedResp.model_dump()\r
  exercise:\r
    prompt: 페이지네이션 응답 예제에서 모델 필드나 입력 dict 값을 바꾸고 검증/직렬화 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      T = TypeVar('T')\r
\r
      class PaginatedResponse(BaseModel, Generic[T]):\r
          items: list[T] = Field(description="데이터 목록")\r
          total: int = Field(description="전체 개수")\r
          page: int = Field(description="현재 페이지")\r
          pageSize: int = Field(description="페이지 크기")\r
          totalPages: int = Field(description="전체 페이지 수")\r
          hasNext: bool = Field(description="다음 페이지 존재")\r
          hasPrev: bool = Field(description="이전 페이지 존재")\r
\r
      class SimpleProduct(BaseModel):\r
          productId: str\r
          name: str\r
          price: float\r
\r
      sampleProducts = [\r
          SimpleProduct(productId="P1", name="Product A", price=100),\r
          SimpleProduct(productId="P2", name="Product B", price=200)\r
      ]\r
\r
      paginatedResp = PaginatedResponse[SimpleProduct](\r
          items=sampleProducts,\r
          total=50,\r
          page=1,\r
          pageSize=20,\r
          totalPages=3,\r
          hasNext=True,\r
          hasPrev=False\r
      )\r
      paginatedResp.model_dump()\r
    hints:\r
    - 바꿀 지점은 모델 필드 선언, 입력 dict, 생성 인자입니다.\r
    - 실행 뒤 model_dump(), 오류 메시지, 반환값이 바꾼 입력을 반영하는지 보세요.\r
  check:\r
    noError: 페이지네이션 응답에서 \`T\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 페이지네이션 응답 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: error\r
  title: 에러 응답\r
  structuredPrimary: true\r
  subtitle: 표준 에러 형식\r
  goal: 에러 응답에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: API 에러 응답도 일관된 형식으로 정의합니다. 에러 코드, 메시지, 상세 정보를 포함하면 클라이언트가 에러를 적절히 처리할 수 있습니다. FastAPI의\r
    HTTPException과 함께 사용하면 표준화된 에러 응답을 반환할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    class ErrorDetail(BaseModel):\r
        field: str = Field(description="에러 필드")\r
        message: str = Field(description="에러 메시지")\r
        code: str = Field(description="에러 코드")\r
\r
    class ErrorResponse(BaseModel):\r
        success: bool = False\r
        error: str = Field(description="에러 타입")\r
        message: str = Field(description="에러 설명")\r
        details: list[ErrorDetail] = Field(default=[], description="상세 에러")\r
        timestamp: datetime = Field(default_factory=datetime.now)\r
\r
    errorResp = ErrorResponse(\r
        error="VALIDATION_ERROR",\r
        message="입력 데이터 검증 실패",\r
        details=[\r
            ErrorDetail(field="email", message="유효한 이메일 형식이 아닙니다", code="invalid_format"),\r
            ErrorDetail(field="password", message="8자 이상이어야 합니다", code="too_short")\r
        ]\r
    )\r
    errorResp.model_dump_json(indent=2)\r
  exercise:\r
    prompt: 에러 응답 예제에서 모델 필드나 입력 dict 값을 바꾸고 검증/직렬화 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      class ErrorDetail(BaseModel):\r
          field: str = Field(description="에러 필드")\r
          message: str = Field(description="에러 메시지")\r
          code: str = Field(description="에러 코드")\r
\r
      class ErrorResponse(BaseModel):\r
          success: bool = False\r
          error: str = Field(description="에러 타입")\r
          message: str = Field(description="에러 설명")\r
          details: list[ErrorDetail] = Field(default=[], description="상세 에러")\r
          timestamp: datetime = Field(default_factory=datetime.now)\r
\r
      errorResp = ErrorResponse(\r
          error="VALIDATION_ERROR",\r
          message="입력 데이터 검증 실패",\r
          details=[\r
              ErrorDetail(field="email", message="유효한 이메일 형식이 아닙니다", code="invalid_format"),\r
              ErrorDetail(field="password", message="8자 이상이어야 합니다", code="too_short")\r
          ]\r
      )\r
      errorResp.model_dump_json(indent=2)\r
    hints:\r
    - 바꿀 지점은 모델 필드 선언, 입력 dict, 생성 인자입니다.\r
    - 실행 뒤 model_dump(), 오류 메시지, 반환값이 바꾼 입력을 반영하는지 보세요.\r
  check:\r
    noError: 에러 응답에서 \`errorResp\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 에러 응답 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: nested\r
  title: 중첩 API 모델\r
  structuredPrimary: true\r
  subtitle: 복잡한 요청/응답\r
  goal: 중첩 API 모델에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 실제 API는 중첩된 복잡한 구조를 가집니다. 주문 생성 요청에는 여러 상품, 배송지, 결제 정보가 포함됩니다. 이런 중첩 구조도 Pydantic 모델로 정의하면\r
    전체가 자동으로 검증됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    class OrderItemRequest(BaseModel):\r
        productId: str\r
        quantity: int = Field(ge=1)\r
        note: Optional[str] = None\r
\r
    class ShippingAddress(BaseModel):\r
        recipientName: str\r
        phone: str\r
        address: str\r
        zipCode: str\r
\r
    class CreateOrderRequest(BaseModel):\r
        items: list[OrderItemRequest] = Field(min_length=1)\r
        shippingAddress: ShippingAddress\r
        paymentMethod: Literal["card", "bank", "cash"]\r
        couponCode: Optional[str] = None\r
\r
    orderRequest = CreateOrderRequest(\r
        items=[\r
            {"productId": "P001", "quantity": 2},\r
            {"productId": "P002", "quantity": 1, "note": "선물포장"}\r
        ],\r
        shippingAddress={\r
            "recipientName": "홍길동",\r
            "phone": "010-1234-5678",\r
            "address": "서울시 강남구 테헤란로 123",\r
            "zipCode": "06234"\r
        },\r
        paymentMethod="card"\r
    )\r
    orderRequest.model_dump()\r
  exercise:\r
    prompt: 중첩 API 모델 예제에서 모델 필드나 입력 dict 값을 바꾸고 검증/직렬화 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      class OrderItemRequest(BaseModel):\r
          productId: str\r
          quantity: int = Field(ge=1)\r
          note: Optional[str] = None\r
\r
      class ShippingAddress(BaseModel):\r
          recipientName: str\r
          phone: str\r
          address: str\r
          zipCode: str\r
\r
      class CreateOrderRequest(BaseModel):\r
          items: list[OrderItemRequest] = Field(min_length=1)\r
          shippingAddress: ShippingAddress\r
          paymentMethod: Literal["card", "bank", "cash"]\r
          couponCode: Optional[str] = None\r
\r
      orderRequest = CreateOrderRequest(\r
          items=[\r
              {"productId": "P001", "quantity": 2},\r
              {"productId": "P002", "quantity": 1, "note": "선물포장"}\r
          ],\r
          shippingAddress={\r
              "recipientName": "홍길동",\r
              "phone": "010-1234-5678",\r
              "address": "서울시 강남구 테헤란로 123",\r
              "zipCode": "06234"\r
          },\r
          paymentMethod="card"\r
      )\r
      orderRequest.model_dump()\r
    hints:\r
    - 바꿀 지점은 모델 필드 선언, 입력 dict, 생성 인자입니다.\r
    - 실행 뒤 model_dump(), 오류 메시지, 반환값이 바꾼 입력을 반영하는지 보세요.\r
  check:\r
    noError: 중첩 API 모델에서 \`orderRequest\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 중첩 API 모델 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: filter\r
  title: 응답 필터링\r
  structuredPrimary: true\r
  subtitle: include/exclude\r
  goal: 응답 필터링에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 상황에 따라 응답에서 특정 필드만 포함하거나 제외해야 할 때가 있습니다. 공개 프로필은 최소 정보만, 관리자 뷰는 전체 정보를 반환하는 식입니다. model_dump의\r
    include/exclude 옵션으로 유연하게 제어할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    class FullUserProfile(BaseModel):\r
        userId: str\r
        username: str\r
        email: str\r
        phone: str\r
        address: str\r
        birthDate: str\r
        createdAt: datetime\r
        lastLoginAt: Optional[datetime] = None\r
        isAdmin: bool = False\r
\r
    fullProfile = FullUserProfile(\r
        userId="U001",\r
        username="alice",\r
        email="alice@example.com",\r
        phone="010-1234-5678",\r
        address="서울시 강남구",\r
        birthDate="1990-01-15",\r
        createdAt="2024-01-01T00:00:00",\r
        lastLoginAt="2024-03-15T10:30:00",\r
        isAdmin=False\r
    )\r
\r
    publicView = fullProfile.model_dump(include={"userId", "username"})\r
    basicView = fullProfile.model_dump(include={"userId", "username", "email", "createdAt"})\r
    publicView, basicView\r
  exercise:\r
    prompt: 응답 필터링 예제에서 모델 필드나 입력 dict 값을 바꾸고 검증/직렬화 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      class FullUserProfile(BaseModel):\r
          userId: str\r
          username: str\r
          email: str\r
          phone: str\r
          address: str\r
          birthDate: str\r
          createdAt: datetime\r
          lastLoginAt: Optional[datetime] = None\r
          isAdmin: bool = False\r
\r
      fullProfile = FullUserProfile(\r
          userId="U001",\r
          username="alice",\r
          email="alice@example.com",\r
          phone="010-1234-5678",\r
          address="서울시 강남구",\r
          birthDate="1990-01-15",\r
          createdAt="2024-01-01T00:00:00",\r
          lastLoginAt="2024-03-15T10:30:00",\r
          isAdmin=False\r
      )\r
\r
      publicView = fullProfile.model_dump(include={"userId", "username"})\r
      basicView = fullProfile.model_dump(include={"userId", "username", "email", "createdAt"})\r
      publicView, basicView\r
    hints:\r
    - 바꿀 지점은 모델 필드 선언, 입력 dict, 생성 인자입니다.\r
    - 실행 뒤 model_dump(), 오류 메시지, 반환값이 바꾼 입력을 반영하는지 보세요.\r
  check:\r
    noError: 응답 필터링에서 \`fullProfile\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 응답 필터링 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: computed\r
  title: 계산 필드 응답\r
  structuredPrimary: true\r
  subtitle: computed_field\r
  goal: 계산 필드 응답에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: 응답에 계산된 값을 포함하려면 computed_field를 사용합니다. 장바구니 총액, 주문 상태 텍스트, 사용자 등급 등 다른 필드에서 계산되는 값을 자동으로\r
    직렬화에 포함시킬 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    class CartItem(BaseModel):\r
        productId: str\r
        productName: str\r
        unitPrice: float\r
        quantity: int\r
\r
        @computed_field\r
        @property\r
        def subtotal(self) -> float:\r
            return self.unitPrice * self.quantity\r
\r
    class CartResponse(BaseModel):\r
        cartId: str\r
        items: list[CartItem]\r
\r
        @computed_field\r
        @property\r
        def totalAmount(self) -> float:\r
            return sum(item.subtotal for item in self.items)\r
\r
        @computed_field\r
        @property\r
        def itemCount(self) -> int:\r
            return sum(item.quantity for item in self.items)\r
\r
    cart = CartResponse(\r
        cartId="CART-001",\r
        items=[\r
            CartItem(productId="P1", productName="노트북", unitPrice=1000000, quantity=1),\r
            CartItem(productId="P2", productName="마우스", unitPrice=50000, quantity=2)\r
        ]\r
    )\r
    cart.model_dump()\r
  exercise:\r
    prompt: 계산 필드 응답 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      class CartItem(BaseModel):\r
          productId: str\r
          productName: str\r
          unitPrice: float\r
          quantity: int\r
\r
          @computed_field\r
          @property\r
          def subtotal(self) -> float:\r
              return self.unitPrice * self.quantity\r
\r
      class CartResponse(BaseModel):\r
          cartId: str\r
          items: list[CartItem]\r
\r
          @computed_field\r
          @property\r
          def totalAmount(self) -> float:\r
              return sum(item.subtotal for item in self.items)\r
\r
          @computed_field\r
          @property\r
          def itemCount(self) -> int:\r
              return sum(item.quantity for item in self.items)\r
\r
      cart = CartResponse(\r
          cartId="CART-001",\r
          items=[\r
              CartItem(productId="P1", productName="노트북", unitPrice=1000000, quantity=1),\r
              CartItem(productId="P2", productName="마우스", unitPrice=50000, quantity=2)\r
          ]\r
      )\r
      cart.model_dump()\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    noError: 계산 필드 응답의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 계산 필드 응답 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: result\r
  title: 완전한 API 모델 세트\r
  structuredPrimary: true\r
  subtitle: 종합 설계\r
  goal: 완전한 API 모델 세트에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 지금까지 배운 모든 패턴을 종합하여 실제 서비스에서 사용할 수 있는 완전한 API 모델 세트를 완성합니다. 성공/실패 응답 래퍼, 상태 Enum, 중첩 모델까지\r
    모두 포함합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    class ApiResponse(BaseModel, Generic[T]):\r
        success: bool = True\r
        data: T\r
        timestamp: datetime = Field(default_factory=datetime.now)\r
\r
    successResp = ApiResponse[UserResponse](data=userResp)\r
    successResp.model_dump_json(indent=2)[:300]\r
  exercise:\r
    prompt: 완전한 API 모델 세트 예제에서 모델 필드나 입력 dict 값을 바꾸고 검증/직렬화 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      class ApiResponse(BaseModel, Generic[T]):\r
          success: bool = True\r
          data: T\r
          timestamp: datetime = Field(default_factory=datetime.now)\r
\r
      successResp = ApiResponse[UserResponse](data=userResp)\r
      successResp.model_dump_json(indent=2)[:300]\r
    hints:\r
    - 바꿀 지점은 모델 필드 선언, 입력 dict, 생성 인자입니다.\r
    - 실행 뒤 model_dump(), 오류 메시지, 반환값이 바꾼 입력을 반영하는지 보세요.\r
  check:\r
    noError: 완전한 API 모델 세트에서 \`successResp\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 완전한 API 모델 세트 실행 뒤 \`successResp\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: API 모델 프로젝트\r
  goal: 실습에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: |-\r
    지금까지 배운 요청/응답 모델, CRUD 패턴, 페이지네이션, 에러 응답, computed_field를 활용하여 완전한 API 모델을 설계합니다.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  snippet: |-\r
    from pydantic import BaseModel, Field, computed_field\r
    from typing import Optional, Literal\r
    from datetime import datetime\r
\r
    class AuthorInfo(BaseModel):\r
        authorId: str\r
        name: str\r
        avatarUrl: Optional[str] = None\r
\r
    class PostBase(BaseModel):\r
        title: str = Field(min_length=1, max_length=200)\r
        content: str = Field(min_length=10)\r
        tags: list[str] = Field(default=[])\r
\r
    class CreatePostRequest(PostBase):\r
        status: Literal["draft", "published"] = "draft"\r
\r
    class UpdatePostRequest(BaseModel):\r
        title: Optional[str] = Field(default=None, min_length=1, max_length=200)\r
        content: Optional[str] = Field(default=None, min_length=10)\r
        tags: Optional[list[str]] = None\r
        status: Optional[Literal["draft", "published"]] = None\r
\r
    class PostResponse(PostBase):\r
        postId: str\r
        author: AuthorInfo\r
        status: str\r
        viewCount: int = 0\r
        likeCount: int = 0\r
        createdAt: datetime\r
        updatedAt: Optional[datetime] = None\r
\r
        @computed_field\r
        @property\r
        def isPublished(self) -> bool:\r
            return self.status == "published"\r
\r
    createReq = CreatePostRequest(\r
        title="Pydantic 가이드",\r
        content="Pydantic은 Python 데이터 검증 라이브러리입니다...",\r
        tags=["python", "pydantic"],\r
        status="published"\r
    )\r
    createReq.model_dump()\r
  exercise:\r
    prompt: 실습 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      from pydantic import BaseModel, Field, computed_field\r
      from typing import Optional, Literal\r
      from datetime import datetime\r
\r
      class AuthorInfo(BaseModel):\r
          authorId: str\r
          name: str\r
          avatarUrl: Optional[str] = None\r
\r
      class PostBase(BaseModel):\r
          title: str = Field(min_length=1, max_length=200)\r
          content: str = Field(min_length=10)\r
          tags: list[str] = Field(default=[])\r
\r
      class CreatePostRequest(PostBase):\r
          status: Literal["draft", "published"] = "draft"\r
\r
      class UpdatePostRequest(BaseModel):\r
          title: Optional[str] = Field(default=None, min_length=1, max_length=200)\r
          content: Optional[str] = Field(default=None, min_length=10)\r
          tags: Optional[list[str]] = None\r
          status: Optional[Literal["draft", "published"]] = None\r
\r
      class PostResponse(PostBase):\r
          postId: str\r
          author: AuthorInfo\r
          status: str\r
          viewCount: int = 0\r
          likeCount: int = 0\r
          createdAt: datetime\r
          updatedAt: Optional[datetime] = None\r
\r
          @computed_field\r
          @property\r
          def isPublished(self) -> bool:\r
              return self.status == "published"\r
\r
      createReq = CreatePostRequest(\r
          title="Pydantic 가이드",\r
          content="Pydantic은 Python 데이터 검증 라이브러리입니다...",\r
          tags=["python", "pydantic"],\r
          status="published"\r
      )\r
      createReq.model_dump()\r
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