var e=`meta:\r
  id: '24'\r
  title: 메타프로그래밍\r
  day: 24\r
  category: advancedPython\r
  tags:\r
  - metaclass\r
  - descriptor\r
  - dynamic\r
  - metaprogramming\r
  - 검증\r
  - 프레임워크설계\r
  seo:\r
    title: 파이썬 메타프로그래밍\r
    description: 메타클래스, 디스크립터, 동적 속성, 코드 생성을 학습합니다.\r
    keywords:\r
    - 메타클래스\r
    - 디스크립터\r
    - 동적 속성\r
    - 코드 생성\r
intro:\r
  emoji: 🔮\r
  points:\r
  - 메타클래스 이해\r
  - 디스크립터 활용\r
  - 동적 속성 구현\r
  - 코드 생성 기법\r
  direction: 메타프로그래밍에서 재사용 가능한 함수형/객체형 설계 조각을 만들고 동작을 검증합니다.\r
  benefits:\r
  - 작은 함수와 상태 확인 후 추상화 패턴에 맞는 코드 입력을 고릅니다.\r
  - 메타프로그래밍 결과를 호출 결과와 예외 경계 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 라이브러리성 유틸리티에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 메타클래스 기초 입력 확인\r
      detail: 입력 기준(작은 함수와 상태)과 필요한 조건을 먼저 고정합니다.\r
    - label: 메타클래스 활용 처리 실행\r
      detail: 추상화 패턴 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 디스크립터 결과 검증\r
      detail: 호출 결과와 예외 경계 기준으로 실행 결과를 비교합니다.\r
    - label: 메타프로그래밍 재사용\r
      detail: 완성 코드를 라이브러리성 유틸리티에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 고급 설계 환경\r
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 메타프로그래밍 실행\r
      detail: 셀을 실행해 호출 결과와 예외 경계와 예외 상태를 확인합니다.\r
    - label: 메타프로그래밍 완료\r
      detail: 검증된 코드를 라이브러리성 유틸리티로 남깁니다.\r
sections:\r
- id: metaclass_basics\r
  title: 메타클래스 기초\r
  structuredPrimary: true\r
  subtitle: 클래스를 생성하는 클래스\r
  goal: 메타클래스 기초에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: 클래스를 생성하는 클래스 - 메타클래스\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    class SimpleMeta(type):\r
        def __new__(mcs, name, bases, namespace):\r
            namespace['created_by'] = 'SimpleMeta'\r
            return super().__new__(mcs, name, bases, namespace)\r
\r
    class MyClass(metaclass=SimpleMeta):\r
        pass\r
\r
    metaInstance = MyClass()\r
    metaCreatedBy = MyClass.created_by\r
    metaType = type(MyClass)\r
    metaResult = (metaCreatedBy, metaType.__name__)\r
    metaResult\r
  exercise:\r
    prompt: 메타클래스 기초 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      class SimpleMeta(type):\r
          def __new__(mcs, name, bases, namespace):\r
              namespace['created_by'] = 'SimpleMeta'\r
              return super().__new__(mcs, name, bases, namespace)\r
\r
      class MyClass(metaclass=SimpleMeta):\r
          pass\r
\r
      metaInstance = MyClass()\r
      metaCreatedBy = MyClass.created_by\r
      metaType = type(MyClass)\r
      metaResult = (metaCreatedBy, metaType.__name__)\r
      metaResult\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 메타클래스 기초의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 메타클래스 기초 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: metaclass_patterns\r
  title: 메타클래스 활용\r
  structuredPrimary: true\r
  subtitle: 싱글톤, 등록, 검증 패턴\r
  goal: 메타클래스 활용에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: 싱글톤, 등록, 검증 등 메타클래스 활용 패턴\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    class SingletonMeta(type):\r
        _instances = {}\r
\r
        def __call__(cls, *args, **kwargs):\r
            if cls not in cls._instances:\r
                cls._instances[cls] = super().__call__(*args, **kwargs)\r
            return cls._instances[cls]\r
\r
    class DatabaseConn(metaclass=SingletonMeta):\r
        def __init__(self):\r
            self.connected = True\r
\r
    dbConn1 = DatabaseConn()\r
    dbConn2 = DatabaseConn()\r
    singletonCheck = dbConn1 is dbConn2\r
    singletonCheck\r
  exercise:\r
    prompt: 메타클래스 활용 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      class SingletonMeta(type):\r
          _instances = {}\r
\r
          def __call__(cls, *args, **kwargs):\r
              if cls not in cls._instances:\r
                  cls._instances[cls] = super().__call__(*args, **kwargs)\r
              return cls._instances[cls]\r
\r
      class DatabaseConn(metaclass=SingletonMeta):\r
          def __init__(self):\r
              self.connected = True\r
\r
      dbConn1 = DatabaseConn()\r
      dbConn2 = DatabaseConn()\r
      singletonCheck = dbConn1 is dbConn2\r
      singletonCheck\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 메타클래스 활용의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 메타클래스 활용 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: descriptors\r
  title: 디스크립터\r
  structuredPrimary: true\r
  subtitle: 속성 접근 제어\r
  goal: 디스크립터에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: 속성 접근을 제어하는 디스크립터 프로토콜\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    class TypedProperty:\r
        def __init__(self, name, expectedType):\r
            self.name = name\r
            self.expectedType = expectedType\r
\r
        def __get__(self, obj, objType=None):\r
            if obj is None:\r
                return self\r
            return obj.__dict__.get(self.name)\r
\r
        def __set__(self, obj, value):\r
            if not isinstance(value, self.expectedType):\r
                raise TypeError(f"Expected {self.expectedType.__name__}")\r
            obj.__dict__[self.name] = value\r
\r
    class Person:\r
        name = TypedProperty('name', str)\r
        age = TypedProperty('age', int)\r
\r
        def __init__(self, name, age):\r
            self.name = name\r
            self.age = age\r
\r
    typedPerson = Person("Alice", 30)\r
    typedName = typedPerson.name\r
    typedAge = typedPerson.age\r
    typedResult = (typedName, typedAge)\r
    typedResult\r
  exercise:\r
    prompt: 디스크립터 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      class TypedProperty:\r
          def __init__(self, name, expectedType):\r
              self.name = name\r
              self.expectedType = expectedType\r
\r
          def __get__(self, obj, objType=None):\r
              if obj is None:\r
                  return self\r
              return obj.__dict__.get(self.name)\r
\r
          def __set__(self, obj, value):\r
              if not isinstance(value, self.expectedType):\r
                  raise TypeError(f"Expected {self.expectedType.__name__}")\r
              obj.__dict__[self.name] = value\r
\r
      class Person:\r
          name = TypedProperty('name', str)\r
          age = TypedProperty('age', int)\r
\r
          def __init__(self, name, age):\r
              self.name = name\r
              self.age = age\r
\r
      typedPerson = Person("Alice", 30)\r
      typedName = typedPerson.name\r
      typedAge = typedPerson.age\r
      typedResult = (typedName, typedAge)\r
      typedResult\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 디스크립터의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 디스크립터 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: dynamic_attrs\r
  title: 동적 속성\r
  structuredPrimary: true\r
  subtitle: __getattr__, __setattr__ 활용\r
  goal: 동적 속성에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: __getattr__, __setattr__, __getattribute__ 활용\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    class DynamicAttrs:\r
        def __init__(self):\r
            self._data = {}\r
\r
        def __getattr__(self, name):\r
            if name.startswith('_'):\r
                raise AttributeError(name)\r
            return self._data.get(name, f"<undefined:{name}>")\r
\r
        def __setattr__(self, name, value):\r
            if name.startswith('_'):\r
                super().__setattr__(name, value)\r
            else:\r
                self._data[name] = value\r
\r
        def __delattr__(self, name):\r
            if name in self._data:\r
                del self._data[name]\r
\r
    dynamicObj = DynamicAttrs()\r
    dynamicObj.foo = "bar"\r
    dynamicObj.count = 42\r
    dynamicFoo = dynamicObj.foo\r
    dynamicCount = dynamicObj.count\r
    dynamicUndef = dynamicObj.undefined\r
    dynamicResult = (dynamicFoo, dynamicCount, dynamicUndef)\r
    dynamicResult\r
  exercise:\r
    prompt: 동적 속성 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      class DynamicAttrs:\r
          def __init__(self):\r
              self._data = {}\r
\r
          def __getattr__(self, name):\r
              if name.startswith('_'):\r
                  raise AttributeError(name)\r
              return self._data.get(name, f"<undefined:{name}>")\r
\r
          def __setattr__(self, name, value):\r
              if name.startswith('_'):\r
                  super().__setattr__(name, value)\r
              else:\r
                  self._data[name] = value\r
\r
          def __delattr__(self, name):\r
              if name in self._data:\r
                  del self._data[name]\r
\r
      dynamicObj = DynamicAttrs()\r
      dynamicObj.foo = "bar"\r
      dynamicObj.count = 42\r
      dynamicFoo = dynamicObj.foo\r
      dynamicCount = dynamicObj.count\r
      dynamicUndef = dynamicObj.undefined\r
      dynamicResult = (dynamicFoo, dynamicCount, dynamicUndef)\r
      dynamicResult\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 동적 속성의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 동적 속성 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: new_init\r
  title: __new__와 __init__\r
  structuredPrimary: true\r
  subtitle: 객체 생성 과정 제어\r
  goal: new와 init에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: 객체 생성 과정 제어하기\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    class ImmutablePoint:\r
        def __new__(cls, x, y):\r
            instance = super().__new__(cls)\r
            object.__setattr__(instance, 'x', x)\r
            object.__setattr__(instance, 'y', y)\r
            return instance\r
\r
        def __setattr__(self, name, value):\r
            raise AttributeError("ImmutablePoint is immutable")\r
\r
        def __repr__(self):\r
            return f"ImmutablePoint({self.x}, {self.y})"\r
\r
    immutablePt = ImmutablePoint(3, 4)\r
    ptX = immutablePt.x\r
    ptY = immutablePt.y\r
    ptRepr = repr(immutablePt)\r
    immutableResult = (ptX, ptY, ptRepr)\r
    immutableResult\r
  exercise:\r
    prompt: new와 init 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      class ImmutablePoint:\r
          def __new__(cls, x, y):\r
              instance = super().__new__(cls)\r
              object.__setattr__(instance, 'x', x)\r
              object.__setattr__(instance, 'y', y)\r
              return instance\r
\r
          def __setattr__(self, name, value):\r
              raise AttributeError("ImmutablePoint is immutable")\r
\r
          def __repr__(self):\r
              return f"ImmutablePoint({self.x}, {self.y})"\r
\r
      immutablePt = ImmutablePoint(3, 4)\r
      ptX = immutablePt.x\r
      ptY = immutablePt.y\r
      ptRepr = repr(immutablePt)\r
      immutableResult = (ptX, ptY, ptRepr)\r
      immutableResult\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: new와 init의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: new와 init 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: dynamic_class\r
  title: 동적 클래스 생성\r
  structuredPrimary: true\r
  subtitle: type()으로 클래스 생성\r
  goal: 동적 클래스 생성에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: type()을 사용한 동적 클래스 생성\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    def makeClass(className, **attrs):\r
        def initMethod(self, **kwargs):\r
            for key, value in kwargs.items():\r
                setattr(self, key, value)\r
\r
        def reprMethod(self):\r
            attrs = ', '.join(f"{k}={v!r}" for k, v in self.__dict__.items())\r
            return f"{self.__class__.__name__}({attrs})"\r
\r
        namespace = {\r
            '__init__': initMethod,\r
            '__repr__': reprMethod,\r
            **attrs\r
        }\r
        return type(className, (), namespace)\r
\r
    DynamicUser = makeClass('DynamicUser', role='user')\r
    dynUser = DynamicUser(name="Alice", age=30)\r
    dynUserRepr = repr(dynUser)\r
    dynUserRole = DynamicUser.role\r
    dynamicClassResult = (dynUserRepr, dynUserRole)\r
    dynamicClassResult\r
  exercise:\r
    prompt: 동적 클래스 생성 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      def makeClass(className, **attrs):\r
          def initMethod(self, **kwargs):\r
              for key, value in kwargs.items():\r
                  setattr(self, key, value)\r
\r
          def reprMethod(self):\r
              attrs = ', '.join(f"{k}={v!r}" for k, v in self.__dict__.items())\r
              return f"{self.__class__.__name__}({attrs})"\r
\r
          namespace = {\r
              '__init__': initMethod,\r
              '__repr__': reprMethod,\r
              **attrs\r
          }\r
          return type(className, (), namespace)\r
\r
      DynamicUser = makeClass('DynamicUser', role='user')\r
      dynUser = DynamicUser(name="Alice", age=30)\r
      dynUserRepr = repr(dynUser)\r
      dynUserRole = DynamicUser.role\r
      dynamicClassResult = (dynUserRepr, dynUserRole)\r
      dynamicClassResult\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 동적 클래스 생성의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 동적 클래스 생성 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: workflow_validation\r
  title: '현업 흐름 검증: 선언형 주문 모델 만들기'\r
  structuredPrimary: true\r
  subtitle: descriptor와 metaclass로 필드 계약을 자동 수집하고 검증합니다\r
  goal: '현업 흐름 검증: 선언형 주문 모델 만들기에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.'\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: |-\r
    메타프로그래밍은 신기한 문법이 아니라 프레임워크가 반복 규칙을 대신 적용하게 만드는 방법입니다. 필드 정의를 클래스 선언에 적으면 메타클래스가 필드를 모으고, 디스크립터가 타입 검증을 수행하는 흐름을 확인하세요.\r
\r
    변주 실험\r
    \`required=False\` 옵션을 Field에 추가하고, 비어 있어도 되는 필드와 반드시 채워야 하는 필드를 \`toDict()\` 전에 검증해보세요.\r
  tips:\r
  - 변주 실험 \`required=False\` 옵션을 Field에 추가하고, 비어 있어도 되는 필드와 반드시 채워야 하는 필드를 \`toDict()\` 전에 검증해보세요.\r
  snippet: |-\r
    class Field:\r
        def __init__(self, expectedType):\r
            self.expectedType = expectedType\r
            self.storageName = ""\r
\r
        def __set_name__(self, owner, name):\r
            self.storageName = f"_{name}"\r
\r
        def __get__(self, instance, owner):\r
            if instance is None:\r
                return self\r
            return getattr(instance, self.storageName)\r
\r
        def __set__(self, instance, value):\r
            if not isinstance(value, self.expectedType):\r
                raise TypeError(f"{self.storageName[1:]} must be {self.expectedType.__name__}")\r
            setattr(instance, self.storageName, value)\r
\r
    class ModelMeta(type):\r
        def __new__(mcls, name, bases, namespace):\r
            fields = {\r
                key: value\r
                for key, value in namespace.items()\r
                if isinstance(value, Field)\r
            }\r
            namespace["fields"] = tuple(fields.keys())\r
            return super().__new__(mcls, name, bases, namespace)\r
\r
    class Model(metaclass=ModelMeta):\r
        def toDict(self):\r
            return {field: getattr(self, field) for field in self.fields}\r
\r
    class Order(Model):\r
        orderId = Field(str)\r
        amount = Field(int)\r
\r
        def __init__(self, orderId, amount):\r
            self.orderId = orderId\r
            self.amount = amount\r
\r
    order = Order("O-100", 12000)\r
\r
    assert Order.fields == ("orderId", "amount")\r
    assert order.toDict() == {"orderId": "O-100", "amount": 12000}\r
  exercise:\r
    prompt: '현업 흐름 검증: 선언형 주문 모델 만들기 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.'\r
    starterCode: |-\r
      class Field:\r
          def __init__(self, expectedType):\r
              self.expectedType = expectedType\r
              self.storageName = ""\r
\r
          def __set_name__(self, owner, name):\r
              self.storageName = f"_{name}"\r
\r
          def __get__(self, instance, owner):\r
              if instance is None:\r
                  return self\r
              return getattr(instance, self.storageName)\r
\r
          def __set__(self, instance, value):\r
              if not isinstance(value, self.expectedType):\r
                  raise TypeError(f"{self.storageName[1:]} must be {self.expectedType.__name__}")\r
              setattr(instance, self.storageName, value)\r
\r
      class ModelMeta(type):\r
          def __new__(mcls, name, bases, namespace):\r
              fields = {\r
                  key: value\r
                  for key, value in namespace.items()\r
                  if isinstance(value, Field)\r
              }\r
              namespace["fields"] = tuple(fields.keys())\r
              return super().__new__(mcls, name, bases, namespace)\r
\r
      class Model(metaclass=ModelMeta):\r
          def toDict(self):\r
              return {field: getattr(self, field) for field in self.fields}\r
\r
      class Order(Model):\r
          orderId = Field(str)\r
          amount = Field(int)\r
\r
          def __init__(self, orderId, amount):\r
              self.orderId = orderId\r
              self.amount = amount\r
\r
      order = Order("O-100", 12000)\r
\r
      assert Order.fields == ("orderId", "amount")\r
      assert order.toDict() == {"orderId": "O-100", "amount": 12000}\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: '현업 흐름 검증: 선언형 주문 모델 만들기의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.'\r
    resultCheck: '현업 흐름 검증: 선언형 주문 모델 만들기 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.'\r
- id: practice\r
  title: 종합 연습\r
  structuredPrimary: true\r
  subtitle: 메타프로그래밍 실습\r
  goal: 종합 연습에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: Day 24에서 배운 메타프로그래밍을 난이도별로 복습합니다. 메타클래스는 클래스 생성 과정을 제어하여 ORM, 검증 프레임워크 등의 기반이 됩니다. 디스크립터는\r
    속성 접근을 세밀하게 제어하고, 동적 속성은 런타임에 클래스를 조작합니다. 🟢 기본 문제로 메타클래스의 __new__와 __init__ 동작을 익히고, 🟡 응용 문제로 디스크립터와\r
    동적 속성 생성을 연습하세요. 🔴 심화 문제에서는 Django ORM, SQLAlchemy 스타일의 선언적 모델 정의를 직접 구현해봅니다. 메타프로그래밍은 프레임워크 설계자의\r
    핵심 도구이므로 원리를 깊이 이해해야 합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    class CounterMeta(type):\r
        count = 0\r
\r
        def __new__(mcs, name, bases, namespace):\r
            CounterMeta.count += 1\r
            namespace['instanceNumber'] = CounterMeta.count\r
            return super().__new__(mcs, name, bases, namespace)\r
\r
    class A(metaclass=CounterMeta):\r
        pass\r
\r
    class B(metaclass=CounterMeta):\r
        pass\r
\r
    class C(metaclass=CounterMeta):\r
        pass\r
\r
    ex1Result = (A.instanceNumber, B.instanceNumber, C.instanceNumber)\r
    ex1Result\r
  exercise:\r
    prompt: 종합 연습 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      class CounterMeta(type):\r
          count = 0\r
\r
          def __new__(mcs, name, bases, namespace):\r
              CounterMeta.count += 1\r
              namespace['instanceNumber'] = CounterMeta.count\r
              return super().__new__(mcs, name, bases, namespace)\r
\r
      class A(metaclass=CounterMeta):\r
          pass\r
\r
      class B(metaclass=CounterMeta):\r
          pass\r
\r
      class C(metaclass=CounterMeta):\r
          pass\r
\r
      ex1Result = (A.instanceNumber, B.instanceNumber, C.instanceNumber)\r
      ex1Result\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:
    type: noError
    noError: 종합 연습의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 종합 연습 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
assessment:
  masteryVariants:
  - id: 24_metaprogramming-validated-model-mastery
    mode: mastery
    unseen: false
    sourceSectionIds:
    - metaclass_patterns
    - descriptors
    - dynamic_class
    - workflow_validation
    title: 선언형 검증 모델 클래스를 동적으로 만들기
    subtitle: descriptor model metaprogramming
    goal: make_model_snapshot(class_name, field_specs, values)를 완성해 디스크립터가 타입을 검증하는 동적 모델 클래스를 만든다.
    why: 메타프로그래밍은 신기한 문법이 아니라, 반복되는 선언 규칙을 프레임워크처럼 안전하게 처리하려는 기술입니다.
    explanation: field_specs는 name과 type을 가진 목록입니다. type은 str, int, float만 허용하고, values를 인스턴스에 넣은 뒤 className, fields, data를 반환하세요.
    tips:
    - 디스크립터의 __set_name__은 클래스가 만들어질 때 속성 이름을 알 수 있게 해줍니다.
    - type(name, bases, namespace)로 런타임에 클래스를 만들 수 있습니다.
    exercise:
      prompt: make_model_snapshot(class_name, field_specs, values)를 완성해 동적 모델의 구조와 값을 반환하세요.
      starterCode: |-
        def make_model_snapshot(class_name, field_specs, values):
            raise NotImplementedError
      solution: |-
        def make_model_snapshot(class_name, field_specs, values):
            type_map = {"str": str, "int": int, "float": float}

            class Field:
                def __init__(self, expected_type):
                    self.expected_type = expected_type
                    self.storage_name = ""

                def __set_name__(self, owner, name):
                    self.storage_name = "_" + name

                def __get__(self, instance, owner):
                    if instance is None:
                        return self
                    return getattr(instance, self.storage_name)

                def __set__(self, instance, value):
                    if not isinstance(value, self.expected_type):
                        raise TypeError(self.storage_name[1:] + " has invalid type")
                    setattr(instance, self.storage_name, value)

            class BaseModel:
                fields = ()

                def __init__(self, **items):
                    for field in self.fields:
                        setattr(self, field, items[field])

                def to_dict(self):
                    return {field: getattr(self, field) for field in self.fields}

            namespace = {"fields": tuple(spec["name"] for spec in field_specs)}
            for spec in field_specs:
                if spec["type"] not in type_map:
                    raise ValueError("unknown field type")
                namespace[spec["name"]] = Field(type_map[spec["type"]])
            model_class = type(class_name, (BaseModel,), namespace)
            instance = model_class(**values)
            return {
                "className": model_class.__name__,
                "fields": list(model_class.fields),
                "data": instance.to_dict(),
            }
      hints:
      - namespace에 fields와 Field 인스턴스를 넣은 뒤 type으로 클래스를 만드세요.
      - 잘못된 값 타입은 descriptor의 __set__에서 TypeError가 나야 합니다.
    check:
      id: python.advanced.metaprogramming.validated-model.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.metaprogramming.empty.behavior.v1.fixture
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
        entry: make_model_snapshot
        cases:
        - id: creates-model-with-typed-descriptors
          arguments:
          - value: Order
          - value:
            - name: orderId
              type: str
            - name: amount
              type: int
          - value:
              orderId: O-100
              amount: 12000
          expectedReturn:
            className: Order
            fields:
            - orderId
            - amount
            data:
              orderId: O-100
              amount: 12000
        - id: rejects-invalid-field-value-type
          arguments:
          - value: Order
          - value:
            - name: amount
              type: int
          - value:
              amount: "12000"
          expectedException: TypeError
        - id: rejects-unknown-field-type
          arguments:
          - value: Order
          - value:
            - name: payload
              type: json
          - value:
              payload: "{}"
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: 24_metaprogramming-plugin-registry-transfer
    mode: transfer
    unseen: true
    sourceSectionIds:
    - dynamic_attrs
    - new_init
    - dynamic_class
    title: 설정 목록으로 플러그인 registry 동적 생성하기
    subtitle: dynamic class registry transfer
    goal: create_plugin_registry(specs)를 완성해 설정 목록에서 동적 클래스를 만들고 registry 요약을 반환한다.
    why: 선언형 모델에서 배운 동적 class 생성을 플러그인 목록으로 옮기면, 메타프로그래밍을 데이터 기반 확장 구조로 이해할 수 있습니다.
    explanation: 각 spec은 name, className, kind, priority를 가집니다. name 중복은 ValueError로 거부하고, 각 동적 클래스의 속성을 registry에 기록하세요.
    tips:
    - type으로 만든 클래스도 __name__과 클래스 속성을 가집니다.
    - registry key 중복을 먼저 확인해야 기존 플러그인이 덮어써지지 않습니다.
    exercise:
      prompt: create_plugin_registry(specs)를 완성해 names와 registry를 반환하세요.
      starterCode: |-
        def create_plugin_registry(specs):
            raise NotImplementedError
      solution: |-
        def create_plugin_registry(specs):
            registry = {}
            for spec in specs:
                name = spec["name"]
                if name in registry:
                    raise ValueError("duplicate plugin name")
                plugin_class = type(
                    spec["className"],
                    (),
                    {
                        "kind": spec["kind"],
                        "priority": spec["priority"],
                    },
                )
                registry[name] = {
                    "className": plugin_class.__name__,
                    "kind": plugin_class.kind,
                    "priority": plugin_class.priority,
                }
            return {"names": sorted(registry), "registry": registry}
      hints:
      - 동적 클래스의 속성은 plugin_class.kind처럼 읽을 수 있습니다.
      - names를 정렬하면 registry 생성 순서와 별개로 결과가 안정됩니다.
    check:
      id: python.advanced.metaprogramming.plugin-registry.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.metaprogramming.empty.behavior.v1.fixture
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
        entry: create_plugin_registry
        cases:
        - id: builds-registry-from-plugin-specs
          arguments:
          - value:
            - name: csv
              className: CsvPlugin
              kind: export
              priority: 20
            - name: audit
              className: AuditPlugin
              kind: observer
              priority: 10
          expectedReturn:
            names:
            - audit
            - csv
            registry:
              csv:
                className: CsvPlugin
                kind: export
                priority: 20
              audit:
                className: AuditPlugin
                kind: observer
                priority: 10
        - id: rejects-duplicate-plugin-name
          arguments:
          - value:
            - name: csv
              className: CsvPlugin
              kind: export
              priority: 20
            - name: csv
              className: OtherCsvPlugin
              kind: export
              priority: 30
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: 24_metaprogramming-tool-choice-retrieval
    mode: retrieval
    unseen: true
    sourceSectionIds:
    - metaclass_basics
    - metaclass_patterns
    - descriptors
    - dynamic_attrs
    - new_init
    - dynamic_class
    title: 메타프로그래밍 도구 선택 기준 회상하기
    subtitle: metaprogramming tool recall
    goal: choose_metaprogramming_tool(need)를 완성해 요구사항별 도구와 위험을 반환한다.
    why: 메타프로그래밍은 강력한 만큼 남용 위험이 큽니다. 어떤 문제에 descriptor, metaclass, 동적 속성, type 생성이 맞는지 구분해야 합니다.
    explanation: validate-attribute, collect-class-declarations, runtime-class-from-config, intercept-missing-attribute, control-instance-creation 상황별 도구를 선택하세요.
    tips:
    - descriptor는 속성 접근을 제어하고, metaclass는 클래스 생성 시점을 제어합니다.
    - getattr와 setattr은 단순 동적 접근에 충분할 때가 많습니다.
    exercise:
      prompt: choose_metaprogramming_tool(need)를 완성해 tool, useWhen, risk를 반환하세요.
      starterCode: |-
        def choose_metaprogramming_tool(need):
            raise NotImplementedError
      solution: |-
        def choose_metaprogramming_tool(need):
            table = {
                "validate-attribute": {
                    "tool": "descriptor",
                    "useWhen": "attribute get or set needs reusable validation",
                    "risk": "hidden side effects can surprise callers",
                },
                "collect-class-declarations": {
                    "tool": "metaclass",
                    "useWhen": "class body declarations must be inspected at creation time",
                    "risk": "normal class decorators may be simpler",
                },
                "runtime-class-from-config": {
                    "tool": "type",
                    "useWhen": "classes are generated from configuration data",
                    "risk": "debugging generated names requires care",
                },
                "intercept-missing-attribute": {
                    "tool": "__getattr__",
                    "useWhen": "unknown attributes should be resolved dynamically",
                    "risk": "typos can look like valid dynamic fields",
                },
                "control-instance-creation": {
                    "tool": "__new__",
                    "useWhen": "object creation must return a controlled instance",
                    "risk": "initialization order becomes harder to reason about",
                },
            }
            if need not in table:
                raise ValueError("unknown metaprogramming need")
            return table[need]
      hints:
      - 먼저 제어하려는 시점이 속성 접근인지, 클래스 생성인지, 인스턴스 생성인지 나누세요.
      - 단순한 문제는 메타클래스보다 함수나 데코레이터가 낫습니다.
    check:
      id: python.advanced.metaprogramming.tool-choice.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.metaprogramming.empty.behavior.v1.fixture
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
        entry: choose_metaprogramming_tool
        cases:
        - id: recalls-descriptor-for-attribute-validation
          arguments:
          - value: validate-attribute
          expectedReturn:
            tool: descriptor
            useWhen: attribute get or set needs reusable validation
            risk: hidden side effects can surprise callers
        - id: recalls-type-for-runtime-class-generation
          arguments:
          - value: runtime-class-from-config
          expectedReturn:
            tool: type
            useWhen: classes are generated from configuration data
            risk: debugging generated names requires care
        - id: rejects-unknown-need
          arguments:
          - value: magic-object
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 24
`;export{e as default};