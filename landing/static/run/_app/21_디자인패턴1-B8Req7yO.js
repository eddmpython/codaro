var e=`meta:
  id: '21'
  title: 디자인 패턴 1
  day: 21
  category: advancedPython
  tags:
  - design-pattern
  - singleton
  - factory
  - builder
  - adapter
  - decorator
  - 검증
  - 설계패턴
  seo:
    title: 파이썬 디자인 패턴 1 - 생성 패턴과 구조 패턴
    description: 싱글톤, 팩토리, 빌더, 어댑터, 데코레이터 패턴을 학습합니다.
    keywords:
    - 디자인 패턴
    - 싱글톤
    - 팩토리
    - 빌더
    - 어댑터
    - 데코레이터
intro:
  emoji: 🎨
  points:
  - 싱글톤 패턴으로 인스턴스 하나만 생성
  - 팩토리 패턴으로 객체 생성 위임
  - 빌더 패턴으로 복잡한 객체 단계적 생성
  - 어댑터와 데코레이터로 구조 확장
  direction: 디자인 패턴 1에서 재사용 가능한 함수형/객체형 설계 조각을 만들고 동작을 검증합니다.
  benefits:
  - 작은 함수와 상태 확인 후 추상화 패턴에 맞는 코드 입력을 고릅니다.
  - 디자인 패턴 1 결과를 호출 결과와 예외 경계 기준으로 즉시 점검합니다.
  - 완료한 코드를 라이브러리성 유틸리티에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: 싱글톤 패턴 입력 확인
      detail: 입력 기준(작은 함수와 상태)과 필요한 조건을 먼저 고정합니다.
    - label: 팩토리 패턴 처리 실행
      detail: 추상화 패턴 코드를 실행해 중간 결과를 확인합니다.
    - label: 빌더 패턴 결과 검증
      detail: 호출 결과와 예외 경계 기준으로 실행 결과를 비교합니다.
    - label: 디자인 패턴 1 재사용
      detail: 완성 코드를 라이브러리성 유틸리티에 붙일 수 있게 정리합니다.
    runtime:
    - label: 고급 설계 환경
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.
    - label: 디자인 패턴 1 실행
      detail: 셀을 실행해 호출 결과와 예외 경계와 예외 상태를 확인합니다.
    - label: 디자인 패턴 1 완료
      detail: 검증된 코드를 라이브러리성 유틸리티로 남깁니다.
sections:
- id: singleton
  title: 싱글톤 패턴
  structuredPrimary: true
  subtitle: 인스턴스 하나만 생성
  goal: 싱글톤 패턴에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: 인스턴스를 하나만 생성하는 패턴
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    class SingletonMeta(type):
        _instances = {}

        def __call__(cls, *args, **kwargs):
            if cls not in cls._instances:
                cls._instances[cls] = super().__call__(*args, **kwargs)
            return cls._instances[cls]

    class Database(metaclass=SingletonMeta):
        def __init__(self):
            self.connection = "Connected"

    db1 = Database()
    db2 = Database()
    singletonCheck = db1 is db2
    singletonCheck
  exercise:
    prompt: 싱글톤 패턴 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      class SingletonMeta(type):
          _instances = {}

          def __call__(cls, *args, **kwargs):
              if cls not in cls._instances:
                  cls._instances[cls] = super().__call__(*args, **kwargs)
              return cls._instances[cls]

      class Database(metaclass=SingletonMeta):
          def __init__(self):
              self.connection = "Connected"

      db1 = Database()
      db2 = Database()
      singletonCheck = db1 is db2
      singletonCheck
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 싱글톤 패턴의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 싱글톤 패턴 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: factory
  title: 팩토리 패턴
  structuredPrimary: true
  subtitle: 객체 생성 위임
  goal: 팩토리 패턴에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: 객체 생성을 서브클래스에 위임하는 패턴
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    from abc import ABC, abstractmethod

    class Animal(ABC):
        @abstractmethod
        def speak(self):
            pass

    class Dog(Animal):
        def speak(self):
            return "Woof!"

    class Cat(Animal):
        def speak(self):
            return "Meow!"

    class AnimalFactory:
        @staticmethod
        def create(animalType):
            if animalType == "dog":
                return Dog()
            elif animalType == "cat":
                return Cat()
            raise ValueError(f"Unknown type: {animalType}")

    factoryDog = AnimalFactory.create("dog")
    factoryCat = AnimalFactory.create("cat")
    factoryResult = (factoryDog.speak(), factoryCat.speak())
    factoryResult
  exercise:
    prompt: 팩토리 패턴 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      from abc import ABC, abstractmethod

      class Animal(ABC):
          @abstractmethod
          def speak(self):
              pass

      class Dog(Animal):
          def speak(self):
              return "Woof!"

      class Cat(Animal):
          def speak(self):
              return "Meow!"

      class AnimalFactory:
          @staticmethod
          def create(animalType):
              if animalType == "dog":
                  return Dog()
              elif animalType == "cat":
                  return Cat()
              raise ValueError(f"Unknown type: {animalType}")

      factoryDog = AnimalFactory.create("dog")
      factoryCat = AnimalFactory.create("cat")
      factoryResult = (factoryDog.speak(), factoryCat.speak())
      factoryResult
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 팩토리 패턴의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 팩토리 패턴 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: builder
  title: 빌더 패턴
  structuredPrimary: true
  subtitle: 복잡한 객체 단계적 생성
  goal: 빌더 패턴에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: 복잡한 객체를 단계적으로 생성하는 패턴
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    class Pizza:
        def __init__(self):
            self.size = None
            self.cheese = False
            self.pepperoni = False
            self.mushrooms = False

        def __str__(self):
            toppings = []
            if self.cheese:
                toppings.append("cheese")
            if self.pepperoni:
                toppings.append("pepperoni")
            if self.mushrooms:
                toppings.append("mushrooms")
            return f"{self.size} pizza with {', '.join(toppings)}"

    class PizzaBuilder:
        def __init__(self):
            self.pizza = Pizza()

        def setSize(self, size):
            self.pizza.size = size
            return self

        def addCheese(self):
            self.pizza.cheese = True
            return self

        def addPepperoni(self):
            self.pizza.pepperoni = True
            return self

        def addMushrooms(self):
            self.pizza.mushrooms = True
            return self

        def build(self):
            return self.pizza

    pizzaBuilt = PizzaBuilder().setSize("large").addCheese().addPepperoni().build()
    pizzaStr = str(pizzaBuilt)
    pizzaStr
  exercise:
    prompt: 빌더 패턴 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      class Pizza:
          def __init__(self):
              self.size = None
              self.cheese = False
              self.pepperoni = False
              self.mushrooms = False

          def __str__(self):
              toppings = []
              if self.cheese:
                  toppings.append("cheese")
              if self.pepperoni:
                  toppings.append("pepperoni")
              if self.mushrooms:
                  toppings.append("mushrooms")
              return f"{self.size} pizza with {', '.join(toppings)}"

      class PizzaBuilder:
          def __init__(self):
              self.pizza = Pizza()

          def setSize(self, size):
              self.pizza.size = size
              return self

          def addCheese(self):
              self.pizza.cheese = True
              return self

          def addPepperoni(self):
              self.pizza.pepperoni = True
              return self

          def addMushrooms(self):
              self.pizza.mushrooms = True
              return self

          def build(self):
              return self.pizza

      pizzaBuilt = PizzaBuilder().setSize("large").addCheese().addPepperoni().build()
      pizzaStr = str(pizzaBuilt)
      pizzaStr
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 빌더 패턴의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 빌더 패턴 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: adapter
  title: 어댑터 패턴
  structuredPrimary: true
  subtitle: 인터페이스 연결
  goal: 어댑터 패턴에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: 호환되지 않는 인터페이스를 연결하는 패턴
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    class OldPrinter:
        def printOld(self, text):
            return f"[OLD] {text}"

    class NewPrinter:
        def printNew(self, text):
            return f"[NEW] {text}"

    class PrinterAdapter:
        def __init__(self, oldPrinter):
            self.oldPrinter = oldPrinter

        def printNew(self, text):
            return self.oldPrinter.printOld(text)

    oldPrt = OldPrinter()
    adapter = PrinterAdapter(oldPrt)
    adapterResult = adapter.printNew("Hello World")
    adapterResult
  exercise:
    prompt: 어댑터 패턴 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      class OldPrinter:
          def printOld(self, text):
              return f"[OLD] {text}"

      class NewPrinter:
          def printNew(self, text):
              return f"[NEW] {text}"

      class PrinterAdapter:
          def __init__(self, oldPrinter):
              self.oldPrinter = oldPrinter

          def printNew(self, text):
              return self.oldPrinter.printOld(text)

      oldPrt = OldPrinter()
      adapter = PrinterAdapter(oldPrt)
      adapterResult = adapter.printNew("Hello World")
      adapterResult
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 어댑터 패턴의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 어댑터 패턴 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: decorator_pattern
  title: 데코레이터 패턴
  structuredPrimary: true
  subtitle: 동적 기능 추가
  goal: 데코레이터 패턴에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: 객체에 동적으로 기능을 추가하는 패턴
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    from abc import ABC, abstractmethod

    class Coffee(ABC):
        @abstractmethod
        def cost(self):
            pass

        @abstractmethod
        def description(self):
            pass

    class SimpleCoffee(Coffee):
        def cost(self):
            return 2.0

        def description(self):
            return "Simple Coffee"

    class CoffeeDecorator(Coffee):
        def __init__(self, coffee):
            self._coffee = coffee

        def cost(self):
            return self._coffee.cost()

        def description(self):
            return self._coffee.description()

    class MilkDecorator(CoffeeDecorator):
        def cost(self):
            return self._coffee.cost() + 0.5

        def description(self):
            return self._coffee.description() + ", Milk"

    class SugarDecorator(CoffeeDecorator):
        def cost(self):
            return self._coffee.cost() + 0.2

        def description(self):
            return self._coffee.description() + ", Sugar"

    simpleCoffee = SimpleCoffee()
    milkCoffee = MilkDecorator(simpleCoffee)
    sweetMilkCoffee = SugarDecorator(milkCoffee)
    coffeeResult = (sweetMilkCoffee.description(), sweetMilkCoffee.cost())
    coffeeResult
  exercise:
    prompt: 데코레이터 패턴 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      from abc import ABC, abstractmethod

      class Coffee(ABC):
          @abstractmethod
          def cost(self):
              pass

          @abstractmethod
          def description(self):
              pass

      class SimpleCoffee(Coffee):
          def cost(self):
              return 2.0

          def description(self):
              return "Simple Coffee"

      class CoffeeDecorator(Coffee):
          def __init__(self, coffee):
              self._coffee = coffee

          def cost(self):
              return self._coffee.cost()

          def description(self):
              return self._coffee.description()

      class MilkDecorator(CoffeeDecorator):
          def cost(self):
              return self._coffee.cost() + 0.5

          def description(self):
              return self._coffee.description() + ", Milk"

      class SugarDecorator(CoffeeDecorator):
          def cost(self):
              return self._coffee.cost() + 0.2

          def description(self):
              return self._coffee.description() + ", Sugar"

      simpleCoffee = SimpleCoffee()
      milkCoffee = MilkDecorator(simpleCoffee)
      sweetMilkCoffee = SugarDecorator(milkCoffee)
      coffeeResult = (sweetMilkCoffee.description(), sweetMilkCoffee.cost())
      coffeeResult
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 데코레이터 패턴의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 데코레이터 패턴 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: prototype
  title: 프로토타입 패턴
  structuredPrimary: true
  subtitle: 객체 복제
  goal: 프로토타입 패턴에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: 기존 객체를 복제하여 새 객체를 생성하는 패턴
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    import copy

    class Prototype:
        def clone(self):
            return copy.deepcopy(self)

    class Document(Prototype):
        def __init__(self, title, content):
            self.title = title
            self.content = content
            self.attachments = []

        def addAttachment(self, attachment):
            self.attachments.append(attachment)

        def __str__(self):
            return f"{self.title}: {self.content} ({len(self.attachments)} attachments)"

    originalDoc = Document("Report", "Annual Report 2024")
    originalDoc.addAttachment("chart.png")
    clonedDoc = originalDoc.clone()
    clonedDoc.title = "Report Copy"
    clonedDoc.addAttachment("table.xlsx")
    protoResult = (str(originalDoc), str(clonedDoc))
    protoResult
  exercise:
    prompt: 프로토타입 패턴 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      import copy

      class Prototype:
          def clone(self):
              return copy.deepcopy(self)

      class Document(Prototype):
          def __init__(self, title, content):
              self.title = title
              self.content = content
              self.attachments = []

          def addAttachment(self, attachment):
              self.attachments.append(attachment)

          def __str__(self):
              return f"{self.title}: {self.content} ({len(self.attachments)} attachments)"

      originalDoc = Document("Report", "Annual Report 2024")
      originalDoc.addAttachment("chart.png")
      clonedDoc = originalDoc.clone()
      clonedDoc.title = "Report Copy"
      clonedDoc.addAttachment("table.xlsx")
      protoResult = (str(originalDoc), str(clonedDoc))
      protoResult
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 프로토타입 패턴의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 프로토타입 패턴 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: workflow_validation
  title: '현업 흐름 검증: 리포트 내보내기 구조 설계하기'
  structuredPrimary: true
  subtitle: Factory, Builder, Adapter, Decorator를 변경 지점 기준으로 검증합니다
  goal: '현업 흐름 검증: 리포트 내보내기 구조 설계하기에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.'
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.
  explanation: |-
    디자인 패턴은 이름을 외우는 것이 아니라 변경이 잦은 지점을 격리하는 방법입니다. 리포트 내보내기 업무에서 포맷 생성은 Factory, 옵션 조립은 Builder, 외부 API 차이는 Adapter, 로깅은 Decorator로 분리해보세요.

    변주 실험
    PDF exporter를 추가할 때 기존 호출 코드를 수정하지 않고 Factory registry와 어댑터만 바꾸는 구조인지 확인하세요.
  tips:
  - 변주 실험 PDF exporter를 추가할 때 기존 호출 코드를 수정하지 않고 Factory registry와 어댑터만 바꾸는 구조인지 확인하세요.
  snippet: |-
    import json

    class CsvExporter:
        def export(self, rows):
            header = ",".join(rows[0].keys())
            body = [",".join(str(value) for value in row.values()) for row in rows]
            return "\\n".join([header, *body])

    class JsonExporter:
        def export(self, rows):
            return json.dumps(rows, ensure_ascii=False)

    class ExporterFactory:
        registry = {
            "csv": CsvExporter,
            "json": JsonExporter,
        }

        @classmethod
        def create(cls, formatName):
            if formatName not in cls.registry:
                raise ValueError(f"unsupported export format: {formatName}")
            return cls.registry[formatName]()

    class LegacyExcelApi:
        def makeWorkbook(self, rows):
            return {"sheet": "orders", "rows": rows}

    class ExcelAdapter:
        def __init__(self, legacyApi):
            self.legacyApi = legacyApi

        def export(self, rows):
            return self.legacyApi.makeWorkbook(rows)

    rows = [{"id": "O-1", "amount": 12000}, {"id": "O-2", "amount": 8000}]

    assert ExporterFactory.create("json").export(rows).startswith("[")
    assert ExporterFactory.create("csv").export(rows).splitlines()[0] == "id,amount"
    assert ExcelAdapter(LegacyExcelApi()).export(rows)["sheet"] == "orders"
  exercise:
    prompt: '현업 흐름 검증: 리포트 내보내기 구조 설계하기 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.'
    starterCode: |-
      import json

      class CsvExporter:
          def export(self, rows):
              header = ",".join(rows[0].keys())
              body = [",".join(str(value) for value in row.values()) for row in rows]
              return "\\n".join([header, *body])

      class JsonExporter:
          def export(self, rows):
              return json.dumps(rows, ensure_ascii=False)

      class ExporterFactory:
          registry = {
              "csv": CsvExporter,
              "json": JsonExporter,
          }

          @classmethod
          def create(cls, formatName):
              if formatName not in cls.registry:
                  raise ValueError(f"unsupported export format: {formatName}")
              return cls.registry[formatName]()

      class LegacyExcelApi:
          def makeWorkbook(self, rows):
              return {"sheet": "orders", "rows": rows}

      class ExcelAdapter:
          def __init__(self, legacyApi):
              self.legacyApi = legacyApi

          def export(self, rows):
              return self.legacyApi.makeWorkbook(rows)

      rows = [{"id": "O-1", "amount": 12000}, {"id": "O-2", "amount": 8000}]

      assert ExporterFactory.create("json").export(rows).startswith("[")
      assert ExporterFactory.create("csv").export(rows).splitlines()[0] == "id,amount"
      assert ExcelAdapter(LegacyExcelApi()).export(rows)["sheet"] == "orders"
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: '현업 흐름 검증: 리포트 내보내기 구조 설계하기의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.'
    resultCheck: '현업 흐름 검증: 리포트 내보내기 구조 설계하기 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.'
- id: practice
  title: 종합 연습
  structuredPrimary: true
  subtitle: 디자인 패턴 마스터하기
  goal: 종합 연습에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: Day 21에서 배운 생성 패턴과 구조 패턴을 난이도별로 복습합니다. 싱글톤 패턴은 데이터베이스 연결, 로거, 설정 관리 등 인스턴스가 하나만 필요한 경우에
    필수적입니다. 팩토리 패턴은 객체 생성 로직을 분리하여 유연성을 높이고, 빌더 패턴은 복잡한 객체를 단계적으로 생성합니다. 🟢 기본 문제로 각 패턴의 핵심 구조를 익히고, 🟡
    응용 문제로 패턴 조합을 연습하세요. 🔴 심화 문제에서는 실제 프레임워크에서 사용되는 고급 패턴 변형을 직접 구현해봅니다. 디자인 패턴은 암기보다 '왜 이 패턴이 필요한가'를
    이해하는 것이 중요합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    class Logger:
        _instance = None

        def __new__(cls):
            if cls._instance is None:
                cls._instance = super().__new__(cls)
                cls._instance.logs = []
            return cls._instance

        def log(self, message):
            self.logs.append(message)

        def getLogs(self):
            return self.logs

    logger1 = Logger()
    logger1.log("First message")
    logger2 = Logger()
    logger2.log("Second message")
    ex1Result = (logger1 is logger2, logger1.getLogs())
    ex1Result
  exercise:
    prompt: 종합 연습 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      class Logger:
          _instance = None

          def __new__(cls):
              if cls._instance is None:
                  cls._instance = super().__new__(cls)
                  cls._instance.logs = []
              return cls._instance

          def log(self, message):
              self.logs.append(message)

          def getLogs(self):
              return self.logs

      logger1 = Logger()
      logger1.log("First message")
      logger2 = Logger()
      logger2.log("Second message")
      ex1Result = (logger1 is logger2, logger1.getLogs())
      ex1Result
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 종합 연습의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 종합 연습 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
assessment:
  masteryVariants:
  - id: 21_design_patterns_creational-exporter-factory-mastery
    mode: mastery
    unseen: true
    sourceSectionIds:
    - factory
    - adapter
    - workflow_validation
    title: 리포트 내보내기 팩토리와 어댑터 만들기
    subtitle: exporter factory and adapter
    goal: export_report(rows, format_name)를 완성해 CSV, JSON, workbook 내보내기를 같은 인터페이스로 처리한다.
    why: 디자인 패턴은 이름 암기가 아니라 변경 지점을 분리하는 도구입니다. 포맷이 늘어나는 리포트 내보내기에서 생성 로직과 legacy API 연결을 분리하는지 확인합니다.
    explanation: csv와 json은 팩토리에서 exporter를 고르고, workbook은 기존 makeWorkbook API를 export 인터페이스로 감싸는 어댑터를 사용하세요.
    tips:
    - 팩토리는 format_name을 보고 적절한 객체를 생성하는 책임만 갖습니다.
    - 어댑터는 기존 객체를 바꾸지 않고 새 인터페이스에 맞춰 감쌉니다.
    exercise:
      prompt: export_report(rows, format_name)를 완성해 format, pattern, payload를 반환하세요.
      starterCode: |-
        def export_report(rows, format_name):
            raise NotImplementedError
      solution: |-
        def export_report(rows, format_name):
            class CsvExporter:
                def export(self, rows):
                    if not rows:
                        return []
                    header = list(rows[0].keys())
                    lines = [",".join(header)]
                    for row in rows:
                        lines.append(",".join(str(row[key]) for key in header))
                    return lines

            class JsonExporter:
                def export(self, rows):
                    return [dict(row) for row in rows]

            class LegacyWorkbookApi:
                def make_workbook(self, rows):
                    return {"sheet": "orders", "rowCount": len(rows), "rows": [dict(row) for row in rows]}

            class WorkbookAdapter:
                def __init__(self, legacy_api):
                    self.legacy_api = legacy_api

                def export(self, rows):
                    return self.legacy_api.make_workbook(rows)

            registry = {
                "csv": CsvExporter,
                "json": JsonExporter,
                "workbook": lambda: WorkbookAdapter(LegacyWorkbookApi()),
            }
            if format_name not in registry:
                raise ValueError("unsupported export format")
            exporter = registry[format_name]()
            return {
                "format": format_name,
                "pattern": "adapter" if format_name == "workbook" else "factory",
                "payload": exporter.export(rows),
            }
      hints:
      - registry 값은 클래스일 수도 있고 객체를 만드는 함수일 수도 있습니다.
      - workbook은 legacy API 반환값을 그대로 payload로 돌려줘도 됩니다.
    check:
      id: python.advanced.design-patterns.exporter-factory.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.design-patterns.empty.behavior.v1.fixture
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
        entry: export_report
        cases:
        - id: exports-csv-through-factory
          arguments:
          - value:
            - id: O-1
              amount: 12000
            - id: O-2
              amount: 8000
          - value: csv
          expectedReturn:
            format: csv
            pattern: factory
            payload:
            - id,amount
            - O-1,12000
            - O-2,8000
        - id: exports-workbook-through-adapter
          arguments:
          - value:
            - id: O-1
              amount: 12000
          - value: workbook
          expectedReturn:
            format: workbook
            pattern: adapter
            payload:
              sheet: orders
              rowCount: 1
              rows:
              - id: O-1
                amount: 12000
        - id: rejects-unknown-format
          arguments:
          - value: []
          - value: pdf
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
  transferVariants:
  - id: 21_design_patterns_creational-prototype-template-transfer
    mode: transfer
    unseen: true
    sourceSectionIds:
    - builder
    - prototype
    - decorator_pattern
    title: 알림 템플릿을 프로토타입으로 복제하고 옵션 덮어쓰기
    subtitle: prototype clone transfer
    goal: clone_notification_template(template, overrides)를 완성해 중첩 템플릿을 복제하고 일부 설정만 바꾼다.
    why: 생성 패턴을 다른 맥락으로 옮기려면 새 객체를 처음부터 만들지, 기존 구성을 복제해 바꿀지 판단할 수 있어야 합니다.
    explanation: template은 channels, copy, flags 같은 중첩 dict와 list를 가질 수 있습니다. 원본을 바꾸지 말고 깊은 복제본에 overrides를 적용하세요.
    tips:
    - 리스트와 딕셔너리는 얕은 복사만으로는 내부 값이 공유될 수 있습니다.
    - overrides는 최상위 key를 바꾸는 것으로 제한하면 동작을 명확하게 검증할 수 있습니다.
    exercise:
      prompt: clone_notification_template(template, overrides)를 완성해 복제 결과와 원본 채널을 반환하세요.
      starterCode: |-
        def clone_notification_template(template, overrides):
            raise NotImplementedError
      solution: |-
        def clone_notification_template(template, overrides):
            def clone(value):
                if isinstance(value, dict):
                    return {key: clone(item) for key, item in value.items()}
                if isinstance(value, list):
                    return [clone(item) for item in value]
                return value

            result = clone(template)
            for key, value in overrides.items():
                result[key] = clone(value)
            return {
                "template": result,
                "originalChannels": list(template.get("channels", [])),
                "sameObject": result is template,
            }
      hints:
      - dict와 list를 만나면 내부 원소까지 다시 clone 해야 합니다.
      - 원본이 바뀌지 않았는지 함께 반환하면 prototype의 의미를 확인할 수 있습니다.
    check:
      id: python.advanced.design-patterns.prototype-template.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.design-patterns.empty.behavior.v1.fixture
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
        entry: clone_notification_template
        cases:
        - id: clones-template-with-overridden-copy
          arguments:
          - value:
              channels:
              - email
              - sms
              copy:
                title: Payment received
                body: Thanks
              flags:
                urgent: false
          - value:
              copy:
                title: Refund created
                body: We are processing it
          expectedReturn:
            template:
              channels:
              - email
              - sms
              copy:
                title: Refund created
                body: We are processing it
              flags:
                urgent: false
            originalChannels:
            - email
            - sms
            sameObject: false
        expectedPaths: []
        normalizeReturnPaths: []
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
  retrievalVariants:
  - id: 21_design_patterns_creational-pattern-choice-retrieval
    mode: retrieval
    unseen: true
    sourceSectionIds:
    - 21_design_patterns_creational-prototype-template-transfer
    title: 생성·구조 패턴 선택 기준 회상하기
    subtitle: creational structural pattern recall
    goal: choose_design_pattern(need)를 완성해 요구사항별 패턴과 남용 위험을 반환한다.
    why: 패턴 학습은 패턴을 많이 쓰는 것이 아니라, 문제의 변경 지점과 책임 경계를 보고 쓰지 않을 때까지 판단하는 데 목적이 있습니다.
    explanation: one-shared-instance, choose-product, stepwise-config, legacy-interface, add-behavior, clone-template 상황별
      패턴을 선택하세요.
    tips:
    - 싱글톤은 테스트와 상태 공유 위험이 있어 꼭 필요한 경우에만 씁니다.
    - 어댑터는 기존 인터페이스를 새 인터페이스에 맞추는 구조 패턴입니다.
    exercise:
      prompt: choose_design_pattern(need)를 완성해 pattern, useWhen, risk를 반환하세요.
      starterCode: |-
        def choose_design_pattern(need):
            raise NotImplementedError
      solution: |-
        def choose_design_pattern(need):
            table = {
                "one-shared-instance": {
                    "pattern": "singleton",
                    "useWhen": "one process-wide coordinator must be shared",
                    "risk": "hidden global state can make tests brittle",
                },
                "choose-product": {
                    "pattern": "factory",
                    "useWhen": "a key or config decides which object to create",
                    "risk": "registry drift hides unsupported choices",
                },
                "stepwise-config": {
                    "pattern": "builder",
                    "useWhen": "an object has many optional construction steps",
                    "risk": "a plain dataclass may be simpler",
                },
                "legacy-interface": {
                    "pattern": "adapter",
                    "useWhen": "old API must satisfy a new interface",
                    "risk": "adapter should not leak legacy method names",
                },
                "add-behavior": {
                    "pattern": "decorator",
                    "useWhen": "behavior is layered around an existing object",
                    "risk": "too many layers make debugging hard",
                },
                "clone-template": {
                    "pattern": "prototype",
                    "useWhen": "new objects mostly copy an existing template",
                    "risk": "shallow copy can share mutable internals",
                },
            }
            if need not in table:
                raise ValueError("unknown design need")
            return table[need]
      hints:
      - 변경될 축이 생성 방식인지, 인터페이스인지, 동작 추가인지 먼저 구분하세요.
      - 패턴 이름보다 남용 위험까지 말할 수 있어야 실무 판단입니다.
    check:
      id: python.advanced.design-patterns.pattern-choice.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.design-patterns.empty.behavior.v1.fixture
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
        entry: choose_design_pattern
        cases:
        - id: recalls-factory-for-product-choice
          arguments:
          - value: choose-product
          expectedReturn:
            pattern: factory
            useWhen: a key or config decides which object to create
            risk: registry drift hides unsupported choices
        - id: recalls-adapter-for-legacy-interface
          arguments:
          - value: legacy-interface
          expectedReturn:
            pattern: adapter
            useWhen: old API must satisfy a new interface
            risk: adapter should not leak legacy method names
        - id: rejects-unknown-need
          arguments:
          - value: pattern-for-everything
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
  schemaVersion: 1
  performanceClaim: 브라우저의 격리된 Python Worker가 숨은 입력으로 핵심 행동과 데이터 계약을 검증하고, 외부 package·파일 artifact가 필요한 실행은 lesson Run 및 Local
    evidence로 분리합니다.
  tierParity:
    web: portable-concept
    local: package-practice-and-artifact
  supportPolicy: 첫 실패는 실제 반환값과 계약 차이를 inline으로 보여주고 정답 전체는 자동 노출하지 않습니다.
  authoring:
    source: curated-existing-assessment
    solutionVerification: required
    independentReview: pending
`;export{e as default};