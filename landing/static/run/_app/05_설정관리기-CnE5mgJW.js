var e=`meta:\r
  packages:\r
  - pydantic\r
  - pydantic-settings\r
  id: pydantic_05\r
  title: 설정관리기\r
  order: 5\r
  category: pydantic\r
  difficulty: ⭐⭐\r
  badge: 기초\r
  tags:\r
  - pydantic\r
  - settings\r
  - 환경변수\r
  - config\r
  - dotenv\r
  seo:\r
    title: Pydantic Settings - 환경변수와 설정 관리\r
    description: pydantic-settings로 애플리케이션 설정을 관리합니다. 환경변수, 중첩 설정, SecretStr을 배웁니다.\r
    keywords:\r
    - pydantic\r
    - settings\r
    - 환경변수\r
    - config\r
    - dotenv\r
intro:\r
  emoji: ⚙️\r
  goal: pydantic-settings로 마이크로서비스 설정 시스템을 구축합니다.\r
  description: 실제 서비스에서 설정은 환경(개발/스테이징/운영)에 따라 달라집니다. 데이터베이스 주소, API 키, 포트 번호 등을 코드에 하드코딩하면 배포할 때마다 수정해야\r
    합니다. pydantic-settings는 환경변수에서 설정을 읽고, 타입 검증까지 해주어 안전하고 유연한 설정 관리를 가능하게 합니다.\r
  direction: 설정관리기에서 입력 스키마를 정의하고 검증된 데이터만 처리 흐름에 넘김합니다.\r
  benefits:\r
  - 외부 입력 확인 후 스키마 검증에 맞는 코드 입력을 고릅니다.\r
  - 설정관리기 결과를 성공 모델과 오류 메시지 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 API/자동화 입력 계약에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 라이브러리 로드 입력 확인\r
      detail: 입력 기준(외부 입력)과 필요한 조건을 먼저 고정합니다.\r
    - label: 기본 설정 클래스 처리 실행\r
      detail: 스키마 검증 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 환경변수 연동 결과 검증\r
      detail: 성공 모델과 오류 메시지 기준으로 실행 결과를 비교합니다.\r
    - label: 설정관리기 재사용\r
      detail: 완성 코드를 API/자동화 입력 계약에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 데이터 계약 환경\r
      detail: pydantic, pydanticsettings 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 설정관리기 실행\r
      detail: 셀을 실행해 성공 모델과 오류 메시지와 예외 상태를 확인합니다.\r
    - label: 설정관리기 완료\r
      detail: 검증된 코드를 API/자동화 입력 계약로 남깁니다.\r
sections:\r
- id: load\r
  title: 라이브러리 로드\r
  structuredPrimary: true\r
  subtitle: pydantic-settings 준비 확인\r
  goal: 라이브러리 로드에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: import 준비가 정확해야 다음 셀과 자동화 코드에서 같은 이름을 안정적으로 재사용할 수 있습니다.\r
  explanation: pydantic-settings는 Pydantic V2에서 별도 패키지로 분리되었습니다. BaseSettings를 상속하면 환경변수에서 자동으로 값을 읽어오고,\r
    타입 힌트에 맞게 변환합니다. 환경변수 → .env 파일 → 기본값 순서로 값을 찾아 유연하게 설정을 관리할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    from pydantic import BaseModel, Field, SecretStr, field_validator\r
    from pydantic_settings import BaseSettings, SettingsConfigDict\r
  exercise:\r
    prompt: 라이브러리 로드 예제에서 import한 이름이나 바로 이어지는 확인 호출을 바꿔 준비 상태를 확인하세요.\r
    starterCode: |-\r
      from pydantic import BaseModel, Field, SecretStr, field_validator\r
      from pydantic_settings import BaseSettings, SettingsConfigDict\r
    hints:\r
    - 바꿀 지점은 외부 입력을 만드는 첫 줄과 스키마 검증 줄에서 찾으세요.\r
    - 실행 뒤 성공 모델과 오류 메시지 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 라이브러리 로드의 import 대상 모듈과 별칭이 현재 로컬 환경에서 준비되어야 합니다.\r
    resultCheck: 라이브러리 로드 실행 결과가 성공 모델과 오류 메시지 기준으로 바꾼 입력값을 반영해야 합니다.\r
- id: basic\r
  title: 기본 설정 클래스\r
  structuredPrimary: true\r
  subtitle: BaseSettings 상속\r
  goal: 기본 설정 클래스에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    BaseSettings를 상속한 클래스는 필드명과 같은 이름의 환경변수에서 자동으로 값을 읽습니다. 필드에 기본값을 지정하면 환경변수가 없을 때 사용됩니다. 타입 힌트에 따라 문자열 환경변수가 자동으로 int, bool 등으로 변환됩니다.\r
\r
    BaseSettings는 대소문자를 구분하지 않습니다. appName 필드는 APPNAME, AppName, appname 등 어떤 형태의 환경변수도 읽습니다.\r
  snippet: |-\r
    class AppSettings(BaseSettings):\r
        appName: str = "MyApp"\r
        debug: bool = False\r
        port: int = 8000\r
\r
    settings = AppSettings()\r
    settings\r
  exercise:\r
    prompt: 기본 설정 클래스 예제에서 \`settings\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      class AppSettings(BaseSettings):\r
          appName: str = "MyApp"\r
          debug: bool = False\r
          port: int = 8000\r
\r
      settings = AppSettings()\r
      settings\r
    hints:\r
    - 바꿀 지점은 \`settings = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`settings\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    noError: 기본 설정 클래스에서 \`settings\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 기본 설정 클래스 실행 뒤 \`settings\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: environ\r
  title: 환경변수 연동\r
  structuredPrimary: true\r
  subtitle: os.environ 시뮬레이션\r
  goal: 환경변수 연동에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 실제 서버에서는 환경변수로 설정을 주입합니다. os.environ으로 환경변수를 설정하면 BaseSettings가 자동으로 읽어옵니다. 이 패턴으로 Docker,\r
    Kubernetes 등에서 설정을 주입할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import os\r
\r
    os.environ["APPNAME"] = "ProductionApp"\r
    os.environ["DEBUG"] = "true"\r
    os.environ["PORT"] = "9000"\r
\r
    prodSettings = AppSettings()\r
    prodSettings\r
  exercise:\r
    prompt: 환경변수 연동 예제에서 환경변수 이름이나 값을 바꾸고 Settings 모델에 반영되는지 확인하세요.\r
    starterCode: |-\r
      import os\r
\r
      os.environ["APPNAME"] = "ProductionApp"\r
      os.environ["DEBUG"] = "true"\r
      os.environ["PORT"] = "9000"\r
\r
      prodSettings = AppSettings()\r
      prodSettings\r
    hints:\r
    - 바꿀 지점은 환경변수 이름, 값, Settings 필드 선언입니다.\r
    - 실행 뒤 Settings 모델 필드와 출력값이 바꾼 환경값을 반영하는지 보세요.\r
  check:\r
    noError: 환경변수 연동에서 \`prodSettings\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 환경변수 연동 실행 뒤 \`prodSettings\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.\r
- id: prefix\r
  title: 환경변수 접두사\r
  structuredPrimary: true\r
  subtitle: env_prefix 설정\r
  goal: model_config의 env_prefix='DB_'를 설정해 환경변수 DB_HOST/DB_PORT가 각각 host/port 필드로 자동 매핑되는지 확인합니다.\r
  why: 같은 환경에서 여러 서비스가 돌 때 환경변수 이름이 충돌합니다. prefix를 두면 서비스마다 네임스페이스가 명확해져 운영 사고가 줄어듭니다.\r
  explanation: 여러 서비스가 같은 환경에서 실행될 때 환경변수 이름 충돌을 방지하려면 접두사를 사용합니다. model_config의 env_prefix로 모든 환경변수에\r
    공통 접두사를 적용합니다. DB_HOST, DB_PORT처럼 의미있는 네이밍이 가능해집니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    class DbSettings(BaseSettings):\r
        model_config = {"env_prefix": "DB_"}\r
\r
        host: str = "localhost"\r
        port: int = 5432\r
        name: str = "mydb"\r
        user: str = "admin"\r
\r
    os.environ["DB_HOST"] = "production-db.example.com"\r
    os.environ["DB_PORT"] = "5433"\r
    os.environ["DB_NAME"] = "production_db"\r
\r
    dbSettings = DbSettings()\r
    dbSettings\r
  exercise:\r
    prompt: 환경변수 접두사 예제에서 접두사와 환경변수 값을 바꾸고 DB 설정 필드가 달라지는지 확인하세요.\r
    starterCode: |-\r
      class DbSettings(BaseSettings):\r
          model_config = {"env_prefix": "DB_"}\r
\r
          host: str = "localhost"\r
          port: int = 5432\r
          name: str = "mydb"\r
          user: str = "admin"\r
\r
      os.environ["DB_HOST"] = "production-db.example.com"\r
      os.environ["DB_PORT"] = "5433"\r
      os.environ["DB_NAME"] = "production_db"\r
\r
      dbSettings = DbSettings()\r
      dbSettings\r
    hints:\r
    - 바꿀 지점은 DB 접두사 환경변수와 Settings 필드 선언입니다.\r
    - 실행 뒤 Settings 인스턴스의 필드와 model_dump 결과가 바꾼 환경값을 반영하는지 보세요.\r
  check:\r
    noError: 환경변수 접두사의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 환경변수 접두사의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: nested\r
  title: 중첩 설정\r
  structuredPrimary: true\r
  subtitle: 설정 그룹화\r
  goal: DatabaseSettings/CacheSettings/LoggingSettings 세 모델을 분리해 메인 Settings에 중첩 필드로 묶고, JSON 환경변수로 그룹 단위 설정을 주입합니다.\r
  why: 모든 설정을 한 평면 모델에 두면 100개 넘는 필드가 한 클래스에 쌓여 가독성이 무너집니다. 도메인별 모델로 쪼개면 변경 영향이 한 모델로 제한됩니다.\r
  explanation: 복잡한 애플리케이션은 설정을 논리적으로 그룹화해야 합니다. 데이터베이스 설정, 캐시 설정, 로깅 설정 등을 별도 모델로 분리하고 메인 설정에서 조합합니다.\r
    중첩된 BaseModel은 JSON 환경변수로 설정할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    class DatabaseConfig(BaseModel):\r
        host: str = "localhost"\r
        port: int = 5432\r
        name: str = "app_db"\r
        poolSize: int = 5\r
\r
    class CacheConfig(BaseModel):\r
        enabled: bool = True\r
        ttl: int = 3600\r
        maxSize: int = 1000\r
\r
    class FullSettings(BaseSettings):\r
        appName: str = "MyApp"\r
        database: DatabaseConfig = DatabaseConfig()\r
        cache: CacheConfig = CacheConfig()\r
\r
    fullSettings = FullSettings()\r
    fullSettings\r
  exercise:\r
    prompt: 중첩 설정 예제에서 database나 cache 하위 설정 값을 바꾸고 중첩 모델 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      class DatabaseConfig(BaseModel):\r
          host: str = "localhost"\r
          port: int = 5432\r
          name: str = "app_db"\r
          poolSize: int = 5\r
\r
      class CacheConfig(BaseModel):\r
          enabled: bool = True\r
          ttl: int = 3600\r
          maxSize: int = 1000\r
\r
      class FullSettings(BaseSettings):\r
          appName: str = "MyApp"\r
          database: DatabaseConfig = DatabaseConfig()\r
          cache: CacheConfig = CacheConfig()\r
\r
      fullSettings = FullSettings()\r
      fullSettings\r
    hints:\r
    - 바꿀 지점은 \`DatabaseConfig\`, \`CacheConfig\`, \`FullSettings\`의 필드와 기본값입니다.\r
    - 실행 뒤 중첩된 Settings 필드와 model_dump 결과가 바꾼 입력을 반영하는지 보세요.\r
  check:\r
    noError: 중첩 설정의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 중첩 설정의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: validation\r
  title: 설정 검증\r
  structuredPrimary: true\r
  subtitle: Field 제약조건\r
  goal: 설정 검증에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: BaseSettings도 일반 Pydantic 모델처럼 Field와 validator를 사용한 검증을 지원합니다. 포트 번호 범위, 타임아웃 최소값, 워커\r
    수 제한 등 비즈니스 규칙을 설정 단계에서 강제할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    from pydantic import field_validator\r
\r
    class ServerSettings(BaseSettings):\r
        host: str = Field(default="0.0.0.0", min_length=1)\r
        port: int = Field(default=8000, ge=1, le=65535)\r
        workers: int = Field(default=4, ge=1, le=32)\r
        timeout: int = Field(default=30, ge=1)\r
\r
        @field_validator('host')\r
        @classmethod\r
        def validateHost(cls, v):\r
            if v == "":\r
                raise ValueError("호스트는 비어있을 수 없습니다")\r
            return v\r
\r
    serverSettings = ServerSettings()\r
    serverSettings\r
  exercise:\r
    prompt: 설정 검증 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      from pydantic import field_validator\r
\r
      class ServerSettings(BaseSettings):\r
          host: str = Field(default="0.0.0.0", min_length=1)\r
          port: int = Field(default=8000, ge=1, le=65535)\r
          workers: int = Field(default=4, ge=1, le=32)\r
          timeout: int = Field(default=30, ge=1)\r
\r
          @field_validator('host')\r
          @classmethod\r
          def validateHost(cls, v):\r
              if v == "":\r
                  raise ValueError("호스트는 비어있을 수 없습니다")\r
              return v\r
\r
      serverSettings = ServerSettings()\r
      serverSettings\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    noError: 설정 검증의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 설정 검증 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: secret\r
  title: 비밀 값 관리\r
  structuredPrimary: true\r
  subtitle: SecretStr\r
  goal: SecretStr 필드를 가진 설정 모델을 만들고, repr/print에서 마스킹되며 get_secret_value()로만 원본을 꺼낼 수 있는지 확인합니다.\r
  why: 비밀번호와 API 키가 stdout/로그에 평문으로 새는 사고는 흔합니다. SecretStr은 출력 경로 전체에 자동 마스킹을 강제해 사람의 실수를 막아 줍니다.\r
  explanation: |-\r
    비밀번호, API 키 같은 민감한 정보는 로그에 노출되면 안 됩니다. SecretStr 타입을 사용하면 출력 시 자동으로 마스킹되고, get_secret_value()로만 실제 값에 접근할 수 있습니다. 디버깅 로그에서 비밀이 노출되는 것을 방지합니다.\r
\r
    SecretStr은 repr에서 '**********'로 표시됩니다. 실제 값은 .get_secret_value() 메서드로 접근합니다.\r
  snippet: |-\r
    class AuthSettings(BaseSettings):\r
        model_config = {"env_prefix": "AUTH_"}\r
\r
        apiKey: SecretStr\r
        dbPassword: SecretStr\r
        jwtSecret: SecretStr = SecretStr("default-secret")\r
\r
    os.environ["AUTH_APIKEY"] = "super-secret-api-key-12345"\r
    os.environ["AUTH_DBPASSWORD"] = "db-password-xyz"\r
\r
    authSettings = AuthSettings()\r
    authSettings\r
  exercise:\r
    prompt: 비밀 값 관리 예제에서 API 키나 토큰 값을 바꾸고 SecretStr 출력과 실제 값 접근이 어떻게 다른지 확인하세요.\r
    starterCode: |-\r
      class AuthSettings(BaseSettings):\r
          model_config = {"env_prefix": "AUTH_"}\r
\r
          apiKey: SecretStr\r
          dbPassword: SecretStr\r
          jwtSecret: SecretStr = SecretStr("default-secret")\r
\r
      os.environ["AUTH_APIKEY"] = "super-secret-api-key-12345"\r
      os.environ["AUTH_DBPASSWORD"] = "db-password-xyz"\r
\r
      authSettings = AuthSettings()\r
      authSettings\r
    hints:\r
    - 바꿀 지점은 SecretStr 필드, 환경변수 값, 출력 확인 방식입니다.\r
    - 실행 뒤 화면 표시용 값과 \`get_secret_value()\` 결과가 각각 어떻게 달라지는지 보세요.\r
  check:\r
    noError: 비밀 값 관리의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 비밀 값 관리의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: json\r
  title: JSON 환경변수\r
  structuredPrimary: true\r
  subtitle: 복잡한 값\r
  goal: JSON 환경변수에서 스키마 검증 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 리스트나 딕셔너리 같은 복잡한 값도 JSON 문자열로 환경변수에 넣을 수 있습니다. BaseSettings가 자동으로 파싱하여 Python 객체로 변환합니다.\r
    CORS 허용 도메인 목록, 기능 플래그 등에 유용합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    class JsonSettings(BaseSettings):\r
        allowedHosts: list[str] = []\r
        features: dict[str, bool] = {}\r
        ports: list[int] = [8000]\r
\r
    os.environ["ALLOWEDHOSTS"] = '["localhost", "example.com", "api.example.com"]'\r
    os.environ["FEATURES"] = '{"darkMode": true, "beta": false, "analytics": true}'\r
    os.environ["PORTS"] = '[8000, 8001, 8002]'\r
\r
    jsonSettings = JsonSettings()\r
    jsonSettings\r
  exercise:\r
    prompt: JSON 환경변수 예제에서 JSON 문자열 안의 옵션 값을 바꾸고 Settings 모델이 파싱한 결과를 확인하세요.\r
    starterCode: |-\r
      class JsonSettings(BaseSettings):\r
          allowedHosts: list[str] = []\r
          features: dict[str, bool] = {}\r
          ports: list[int] = [8000]\r
\r
      os.environ["ALLOWEDHOSTS"] = '["localhost", "example.com", "api.example.com"]'\r
      os.environ["FEATURES"] = '{"darkMode": true, "beta": false, "analytics": true}'\r
      os.environ["PORTS"] = '[8000, 8001, 8002]'\r
\r
      jsonSettings = JsonSettings()\r
      jsonSettings\r
    hints:\r
    - 바꿀 지점은 JSON 환경변수 문자열과 Settings 필드 타입입니다.\r
    - 실행 뒤 파싱된 리스트/딕셔너리 필드가 바꾼 JSON 값을 반영하는지 보세요.\r
  check:\r
    noError: JSON 환경변수에서 \`jsonSettings\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: JSON 환경변수 실행 뒤 \`jsonSettings\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.\r
- id: singleton\r
  title: 싱글톤 패턴\r
  structuredPrimary: true\r
  subtitle: lru_cache 활용\r
  goal: functools.lru_cache로 감싼 getSettings 함수가 여러 호출에서 같은 인스턴스를 돌려주는지 is 비교로 확인합니다.\r
  why: 설정 로드는 환경변수/파일 읽기를 동반해 매 호출이 비쌉니다. lru_cache 싱글톤 패턴은 첫 호출 결과를 재사용해 앱 전체에서 일관된 설정 객체를 보장합니다.\r
  explanation: |-\r
    설정을 매번 새로 로드하면 성능이 낭비됩니다. functools.lru_cache를 사용하면 설정 객체를 캐싱하여 애플리케이션 전체에서 동일한 인스턴스를 재사용합니다. FastAPI 등 프레임워크에서 권장하는 패턴입니다.\r
\r
    lru_cache는 동일한 인자에 대해 같은 결과를 반환합니다. 설정을 변경하려면 getSettings.cache_clear()로 캐시를 비워야 합니다.\r
  snippet: |-\r
    from functools import lru_cache\r
\r
    class AppConfig(BaseSettings):\r
        appName: str = "MyApp"\r
        version: str = "1.0.0"\r
        debug: bool = False\r
\r
    @lru_cache\r
    def getSettings() -> AppConfig:\r
        return AppConfig()\r
\r
    config1 = getSettings()\r
    config2 = getSettings()\r
    config1 is config2\r
  exercise:\r
    prompt: 싱글톤 패턴 예제에서 캐시 함수 입력이나 설정 값을 바꾸고 같은 객체가 재사용되는지 확인하세요.\r
    starterCode: |-\r
      from functools import lru_cache\r
\r
      class AppConfig(BaseSettings):\r
          appName: str = "MyApp"\r
          version: str = "1.0.0"\r
          debug: bool = False\r
\r
      @lru_cache\r
      def getSettings() -> AppConfig:\r
          return AppConfig()\r
\r
      config1 = getSettings()\r
      config2 = getSettings()\r
      config1 is config2\r
    hints:\r
    - 바꿀 지점은 \`getSettings()\`의 캐시 대상과 Settings 생성 흐름입니다.\r
    - 실행 뒤 객체 identity와 설정 필드가 캐시 정책을 어떻게 반영하는지 보세요.\r
  check:\r
    noError: 싱글톤 패턴의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 싱글톤 패턴 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: result\r
  title: 마이크로서비스 설정\r
  structuredPrimary: true\r
  subtitle: 종합 설정 시스템\r
  goal: 환경별 분리(dev/prod), 중첩 모델, SecretStr, lru_cache, 검증을 결합한 마이크로서비스 설정 시스템 한 개를 종합 구성합니다.\r
  why: 운영 마이크로서비스의 설정 시스템은 강의 단편을 합쳐 만들어진 형태입니다. 한 번 완성된 베이스 모델이 새 서비스의 출발점이 됩니다.\r
  explanation: 지금까지 배운 모든 기법을 종합하여 실제 마이크로서비스에서 사용할 수 있는 설정 시스템을 완성합니다. 중첩 설정, 환경별 분리, 비밀 관리, 검증까지 모두\r
    포함한 완전한 설정 관리 시스템입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    from typing import Literal\r
\r
    class DbConfig(BaseModel):\r
        host: str = "localhost"\r
        port: int = Field(default=5432, ge=1, le=65535)\r
        name: str = "app_db"\r
        poolMin: int = Field(default=2, ge=1)\r
        poolMax: int = Field(default=10, ge=1)\r
\r
    class RedisConfig(BaseModel):\r
        host: str = "localhost"\r
        port: int = 6379\r
        db: int = 0\r
\r
    class ServiceSettings(BaseSettings):\r
        model_config = {"env_prefix": "SVC_"}\r
\r
        serviceName: str\r
        environment: Literal["dev", "staging", "prod"] = "dev"\r
        logLevel: Literal["DEBUG", "INFO", "WARNING", "ERROR"] = "INFO"\r
        database: DbConfig = DbConfig()\r
        redis: RedisConfig = RedisConfig()\r
        apiKey: SecretStr | None = None\r
        allowedOrigins: list[str] = ["http://localhost:3000"]\r
\r
    os.environ["SVC_SERVICENAME"] = "user-service"\r
    os.environ["SVC_ENVIRONMENT"] = "prod"\r
    os.environ["SVC_LOGLEVEL"] = "WARNING"\r
    os.environ["SVC_APIKEY"] = "prod-api-key-secret"\r
    os.environ["SVC_ALLOWEDORIGINS"] = '["https://example.com", "https://api.example.com"]'\r
\r
    svcSettings = ServiceSettings()\r
    svcSettings\r
  exercise:\r
    prompt: 마이크로서비스 설정 예제에서 서비스 이름, 포트, 환경 값을 바꾸고 검증된 설정 모델을 확인하세요.\r
    starterCode: |-\r
      from typing import Literal\r
\r
      class DbConfig(BaseModel):\r
          host: str = "localhost"\r
          port: int = Field(default=5432, ge=1, le=65535)\r
          name: str = "app_db"\r
          poolMin: int = Field(default=2, ge=1)\r
          poolMax: int = Field(default=10, ge=1)\r
\r
      class RedisConfig(BaseModel):\r
          host: str = "localhost"\r
          port: int = 6379\r
          db: int = 0\r
\r
      class ServiceSettings(BaseSettings):\r
          model_config = {"env_prefix": "SVC_"}\r
\r
          serviceName: str\r
          environment: Literal["dev", "staging", "prod"] = "dev"\r
          logLevel: Literal["DEBUG", "INFO", "WARNING", "ERROR"] = "INFO"\r
          database: DbConfig = DbConfig()\r
          redis: RedisConfig = RedisConfig()\r
          apiKey: SecretStr | None = None\r
          allowedOrigins: list[str] = ["http://localhost:3000"]\r
\r
      os.environ["SVC_SERVICENAME"] = "user-service"\r
      os.environ["SVC_ENVIRONMENT"] = "prod"\r
      os.environ["SVC_LOGLEVEL"] = "WARNING"\r
      os.environ["SVC_APIKEY"] = "prod-api-key-secret"\r
      os.environ["SVC_ALLOWEDORIGINS"] = '["https://example.com", "https://api.example.com"]'\r
\r
      svcSettings = ServiceSettings()\r
      svcSettings\r
    hints:\r
    - 바꿀 지점은 서비스 설정 필드, Literal 환경값, 포트 범위입니다.\r
    - 실행 뒤 Settings 모델의 필드와 검증 오류 여부가 바꾼 입력을 반영하는지 보세요.\r
  check:\r
    noError: 마이크로서비스 설정의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 마이크로서비스 설정의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 설정 관리 프로젝트\r
  goal: BaseSettings, env_prefix, 중첩, SecretStr, JSON 환경변수를 실제 애플리케이션 설정 모델 한 개로 결합해 직접 실습합니다.\r
  why: 강의 본문은 한 기법씩 분리해 익혔습니다. 실습에서는 그 기법들을 한 모델로 합쳐 봐야 운영 시나리오에서 어떻게 결합되는지 손에 익습니다.\r
  explanation: |-\r
    지금까지 배운 BaseSettings, 접두사, 중첩 설정, SecretStr, JSON 환경변수를 활용하여 실제 애플리케이션 설정 시스템을 구축합니다.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  snippet: |-\r
    from pydantic_settings import BaseSettings\r
    from pydantic import BaseModel, Field, SecretStr\r
    from functools import lru_cache\r
    import os\r
\r
    class ServerConfig(BaseModel):\r
        host: str = "0.0.0.0"\r
        port: int = Field(default=8000, ge=1, le=65535)\r
        workers: int = Field(default=4, ge=1)\r
        debug: bool = False\r
\r
    class DatabaseConfig(BaseModel):\r
        host: str = "localhost"\r
        port: int = 5432\r
        name: str = "app_db"\r
        poolSize: int = Field(default=5, ge=1, le=20)\r
\r
    class WebAppSettings(BaseSettings):\r
        model_config = {"env_prefix": "WEBAPP_"}\r
\r
        appName: str = "WebApp"\r
        version: str = "1.0.0"\r
        server: ServerConfig = ServerConfig()\r
        database: DatabaseConfig = DatabaseConfig()\r
\r
    @lru_cache\r
    def getWebAppSettings() -> WebAppSettings:\r
        return WebAppSettings()\r
\r
    webSettings = getWebAppSettings()\r
    webSettings\r
  exercise:\r
    prompt: 실습 예제에서 웹 서비스 설정 값을 바꾸고 BaseSettings가 환경/기본값을 어떻게 조합하는지 확인하세요.\r
    starterCode: |-\r
      from pydantic_settings import BaseSettings\r
      from pydantic import BaseModel, Field, SecretStr\r
      from functools import lru_cache\r
      import os\r
\r
      class ServerConfig(BaseModel):\r
          host: str = "0.0.0.0"\r
          port: int = Field(default=8000, ge=1, le=65535)\r
          workers: int = Field(default=4, ge=1)\r
          debug: bool = False\r
\r
      class DatabaseConfig(BaseModel):\r
          host: str = "localhost"\r
          port: int = 5432\r
          name: str = "app_db"\r
          poolSize: int = Field(default=5, ge=1, le=20)\r
\r
      class WebAppSettings(BaseSettings):\r
          model_config = {"env_prefix": "WEBAPP_"}\r
\r
          appName: str = "WebApp"\r
          version: str = "1.0.0"\r
          server: ServerConfig = ServerConfig()\r
          database: DatabaseConfig = DatabaseConfig()\r
\r
      @lru_cache\r
      def getWebAppSettings() -> WebAppSettings:\r
          return WebAppSettings()\r
\r
      webSettings = getWebAppSettings()\r
      webSettings\r
    hints:\r
    - 바꿀 지점은 웹 서비스 Settings 필드, 기본값, 환경변수 입력입니다.\r
    - 실행 뒤 생성된 설정 모델과 model_dump 결과가 바꾼 입력을 반영하는지 보세요.\r
  check:\r
    noError: 실습의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
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