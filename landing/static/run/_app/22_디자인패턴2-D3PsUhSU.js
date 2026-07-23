var e=`meta:\r
  id: '22'\r
  title: 디자인 패턴 2\r
  day: 22\r
  category: advancedPython\r
  tags:\r
  - design-pattern\r
  - observer\r
  - strategy\r
  - command\r
  - state\r
  - template-method\r
  - 검증\r
  - 행동패턴\r
  seo:\r
    title: 파이썬 디자인 패턴 2 - 행동 패턴\r
    description: 옵저버, 전략, 커맨드, 상태, 템플릿 메서드, 책임 연쇄 패턴을 학습합니다.\r
    keywords:\r
    - 디자인 패턴\r
    - 행동 패턴\r
    - 옵저버\r
    - 전략\r
    - 커맨드\r
    - 상태\r
intro:\r
  emoji: 🎭\r
  points:\r
  - 옵저버 패턴으로 이벤트 기반 통신\r
  - 전략 패턴으로 알고리즘 교체\r
  - 커맨드 패턴으로 요청 캡슐화\r
  - 상태 패턴으로 행동 변경\r
  direction: 디자인 패턴 2에서 재사용 가능한 함수형/객체형 설계 조각을 만들고 동작을 검증합니다.\r
  benefits:\r
  - 작은 함수와 상태 확인 후 추상화 패턴에 맞는 코드 입력을 고릅니다.\r
  - 디자인 패턴 2 결과를 호출 결과와 예외 경계 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 라이브러리성 유틸리티에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 옵저버 패턴 입력 확인\r
      detail: 입력 기준(작은 함수와 상태)과 필요한 조건을 먼저 고정합니다.\r
    - label: 전략 패턴 처리 실행\r
      detail: 추상화 패턴 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 커맨드 패턴 결과 검증\r
      detail: 호출 결과와 예외 경계 기준으로 실행 결과를 비교합니다.\r
    - label: 디자인 패턴 2 재사용\r
      detail: 완성 코드를 라이브러리성 유틸리티에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 고급 설계 환경\r
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 디자인 패턴 2 실행\r
      detail: 셀을 실행해 호출 결과와 예외 경계와 예외 상태를 확인합니다.\r
    - label: 디자인 패턴 2 완료\r
      detail: 검증된 코드를 라이브러리성 유틸리티로 남깁니다.\r
sections:\r
- id: observer_pattern\r
  title: 옵저버 패턴\r
  structuredPrimary: true\r
  subtitle: 상태 변화 통지\r
  goal: 옵저버 패턴에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: 객체 상태 변화를 다른 객체에 통지하는 패턴\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    from abc import ABC, abstractmethod\r
\r
    class Observer(ABC):\r
        @abstractmethod\r
        def update(self, message):\r
            pass\r
\r
    class Subject:\r
        def __init__(self):\r
            self._observers = []\r
\r
        def attach(self, observer):\r
            self._observers.append(observer)\r
\r
        def detach(self, observer):\r
            self._observers.remove(observer)\r
\r
        def notify(self, message):\r
            for observer in self._observers:\r
                observer.update(message)\r
\r
    class EmailSubscriber(Observer):\r
        def __init__(self, name):\r
            self.name = name\r
            self.messages = []\r
\r
        def update(self, message):\r
            self.messages.append(message)\r
\r
    class SMSSubscriber(Observer):\r
        def __init__(self, phone):\r
            self.phone = phone\r
            self.messages = []\r
\r
        def update(self, message):\r
            self.messages.append(f"SMS: {message}")\r
\r
    newsPublisher = Subject()\r
    emailSub = EmailSubscriber("Alice")\r
    smsSub = SMSSubscriber("123-456")\r
    newsPublisher.attach(emailSub)\r
    newsPublisher.attach(smsSub)\r
    newsPublisher.notify("Breaking News!")\r
    observerResult = (emailSub.messages, smsSub.messages)\r
    observerResult\r
  exercise:\r
    prompt: 옵저버 패턴 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      from abc import ABC, abstractmethod\r
\r
      class Observer(ABC):\r
          @abstractmethod\r
          def update(self, message):\r
              pass\r
\r
      class Subject:\r
          def __init__(self):\r
              self._observers = []\r
\r
          def attach(self, observer):\r
              self._observers.append(observer)\r
\r
          def detach(self, observer):\r
              self._observers.remove(observer)\r
\r
          def notify(self, message):\r
              for observer in self._observers:\r
                  observer.update(message)\r
\r
      class EmailSubscriber(Observer):\r
          def __init__(self, name):\r
              self.name = name\r
              self.messages = []\r
\r
          def update(self, message):\r
              self.messages.append(message)\r
\r
      class SMSSubscriber(Observer):\r
          def __init__(self, phone):\r
              self.phone = phone\r
              self.messages = []\r
\r
          def update(self, message):\r
              self.messages.append(f"SMS: {message}")\r
\r
      newsPublisher = Subject()\r
      emailSub = EmailSubscriber("Alice")\r
      smsSub = SMSSubscriber("123-456")\r
      newsPublisher.attach(emailSub)\r
      newsPublisher.attach(smsSub)\r
      newsPublisher.notify("Breaking News!")\r
      observerResult = (emailSub.messages, smsSub.messages)\r
      observerResult\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 옵저버 패턴의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 옵저버 패턴 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: strategy_pattern\r
  title: 전략 패턴\r
  structuredPrimary: true\r
  subtitle: 알고리즘 캡슐화\r
  goal: 전략 패턴에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: 알고리즘을 캡슐화하여 교체 가능하게 하는 패턴\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    from abc import ABC, abstractmethod\r
\r
    class PaymentStrategy(ABC):\r
        @abstractmethod\r
        def pay(self, amount):\r
            pass\r
\r
    class CreditCardPayment(PaymentStrategy):\r
        def __init__(self, cardNumber):\r
            self.cardNumber = cardNumber\r
\r
        def pay(self, amount):\r
            return f"Paid \${amount} with card ending {self.cardNumber[-4:]}"\r
\r
    class PayPalPayment(PaymentStrategy):\r
        def __init__(self, email):\r
            self.email = email\r
\r
        def pay(self, amount):\r
            return f"Paid \${amount} via PayPal ({self.email})"\r
\r
    class CryptoPayment(PaymentStrategy):\r
        def __init__(self, wallet):\r
            self.wallet = wallet\r
\r
        def pay(self, amount):\r
            return f"Paid \${amount} in crypto to {self.wallet[:8]}..."\r
\r
    class ShoppingCart:\r
        def __init__(self):\r
            self.items = []\r
            self.paymentStrategy = None\r
\r
        def addItem(self, item, price):\r
            self.items.append((item, price))\r
\r
        def setPaymentStrategy(self, strategy):\r
            self.paymentStrategy = strategy\r
\r
        def checkout(self):\r
            total = sum(price for _, price in self.items)\r
            return self.paymentStrategy.pay(total)\r
\r
    cart = ShoppingCart()\r
    cart.addItem("Book", 20)\r
    cart.addItem("Pen", 5)\r
    cart.setPaymentStrategy(CreditCardPayment("1234567890123456"))\r
    payResult1 = cart.checkout()\r
    cart.setPaymentStrategy(PayPalPayment("user@email.com"))\r
    payResult2 = cart.checkout()\r
    strategyResult = (payResult1, payResult2)\r
    strategyResult\r
  exercise:\r
    prompt: 전략 패턴 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      from abc import ABC, abstractmethod\r
\r
      class PaymentStrategy(ABC):\r
          @abstractmethod\r
          def pay(self, amount):\r
              pass\r
\r
      class CreditCardPayment(PaymentStrategy):\r
          def __init__(self, cardNumber):\r
              self.cardNumber = cardNumber\r
\r
          def pay(self, amount):\r
              return f"Paid \${amount} with card ending {self.cardNumber[-4:]}"\r
\r
      class PayPalPayment(PaymentStrategy):\r
          def __init__(self, email):\r
              self.email = email\r
\r
          def pay(self, amount):\r
              return f"Paid \${amount} via PayPal ({self.email})"\r
\r
      class CryptoPayment(PaymentStrategy):\r
          def __init__(self, wallet):\r
              self.wallet = wallet\r
\r
          def pay(self, amount):\r
              return f"Paid \${amount} in crypto to {self.wallet[:8]}..."\r
\r
      class ShoppingCart:\r
          def __init__(self):\r
              self.items = []\r
              self.paymentStrategy = None\r
\r
          def addItem(self, item, price):\r
              self.items.append((item, price))\r
\r
          def setPaymentStrategy(self, strategy):\r
              self.paymentStrategy = strategy\r
\r
          def checkout(self):\r
              total = sum(price for _, price in self.items)\r
              return self.paymentStrategy.pay(total)\r
\r
      cart = ShoppingCart()\r
      cart.addItem("Book", 20)\r
      cart.addItem("Pen", 5)\r
      cart.setPaymentStrategy(CreditCardPayment("1234567890123456"))\r
      payResult1 = cart.checkout()\r
      cart.setPaymentStrategy(PayPalPayment("user@email.com"))\r
      payResult2 = cart.checkout()\r
      strategyResult = (payResult1, payResult2)\r
      strategyResult\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 전략 패턴의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 전략 패턴 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: command_pattern\r
  title: 커맨드 패턴\r
  structuredPrimary: true\r
  subtitle: 요청 캡슐화\r
  goal: 커맨드 패턴에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: 요청을 객체로 캡슐화하여 매개변수화하는 패턴\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    from abc import ABC, abstractmethod\r
\r
    class Command(ABC):\r
        @abstractmethod\r
        def execute(self):\r
            pass\r
\r
        @abstractmethod\r
        def undo(self):\r
            pass\r
\r
    class Light:\r
        def __init__(self):\r
            self.isOn = False\r
\r
        def turnOn(self):\r
            self.isOn = True\r
            return "Light is ON"\r
\r
        def turnOff(self):\r
            self.isOn = False\r
            return "Light is OFF"\r
\r
    class LightOnCommand(Command):\r
        def __init__(self, light):\r
            self.light = light\r
\r
        def execute(self):\r
            return self.light.turnOn()\r
\r
        def undo(self):\r
            return self.light.turnOff()\r
\r
    class LightOffCommand(Command):\r
        def __init__(self, light):\r
            self.light = light\r
\r
        def execute(self):\r
            return self.light.turnOff()\r
\r
        def undo(self):\r
            return self.light.turnOn()\r
\r
    class RemoteControl:\r
        def __init__(self):\r
            self.history = []\r
\r
        def submit(self, command):\r
            result = command.execute()\r
            self.history.append(command)\r
            return result\r
\r
        def undoLast(self):\r
            if self.history:\r
                return self.history.pop().undo()\r
            return "Nothing to undo"\r
\r
    light = Light()\r
    remote = RemoteControl()\r
    cmdResult1 = remote.submit(LightOnCommand(light))\r
    cmdResult2 = remote.submit(LightOffCommand(light))\r
    cmdResult3 = remote.undoLast()\r
    commandResult = (cmdResult1, cmdResult2, cmdResult3, light.isOn)\r
    commandResult\r
  exercise:\r
    prompt: 커맨드 패턴 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      from abc import ABC, abstractmethod\r
\r
      class Command(ABC):\r
          @abstractmethod\r
          def execute(self):\r
              pass\r
\r
          @abstractmethod\r
          def undo(self):\r
              pass\r
\r
      class Light:\r
          def __init__(self):\r
              self.isOn = False\r
\r
          def turnOn(self):\r
              self.isOn = True\r
              return "Light is ON"\r
\r
          def turnOff(self):\r
              self.isOn = False\r
              return "Light is OFF"\r
\r
      class LightOnCommand(Command):\r
          def __init__(self, light):\r
              self.light = light\r
\r
          def execute(self):\r
              return self.light.turnOn()\r
\r
          def undo(self):\r
              return self.light.turnOff()\r
\r
      class LightOffCommand(Command):\r
          def __init__(self, light):\r
              self.light = light\r
\r
          def execute(self):\r
              return self.light.turnOff()\r
\r
          def undo(self):\r
              return self.light.turnOn()\r
\r
      class RemoteControl:\r
          def __init__(self):\r
              self.history = []\r
\r
          def submit(self, command):\r
              result = command.execute()\r
              self.history.append(command)\r
              return result\r
\r
          def undoLast(self):\r
              if self.history:\r
                  return self.history.pop().undo()\r
              return "Nothing to undo"\r
\r
      light = Light()\r
      remote = RemoteControl()\r
      cmdResult1 = remote.submit(LightOnCommand(light))\r
      cmdResult2 = remote.submit(LightOffCommand(light))\r
      cmdResult3 = remote.undoLast()\r
      commandResult = (cmdResult1, cmdResult2, cmdResult3, light.isOn)\r
      commandResult\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 커맨드 패턴의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 커맨드 패턴 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: state_pattern\r
  title: 상태 패턴\r
  structuredPrimary: true\r
  subtitle: 상태에 따른 행동 변경\r
  goal: 상태 패턴에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: 객체의 상태에 따라 행동을 변경하는 패턴\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    from abc import ABC, abstractmethod\r
\r
    class State(ABC):\r
        @abstractmethod\r
        def insertCoin(self):\r
            pass\r
\r
        @abstractmethod\r
        def ejectCoin(self):\r
            pass\r
\r
        @abstractmethod\r
        def dispense(self):\r
            pass\r
\r
    class NoCoinState(State):\r
        def __init__(self, machine):\r
            self.machine = machine\r
\r
        def insertCoin(self):\r
            self.machine.setState(self.machine.hasCoinState)\r
            return "Coin inserted"\r
\r
        def ejectCoin(self):\r
            return "No coin to eject"\r
\r
        def dispense(self):\r
            return "Insert coin first"\r
\r
    class HasCoinState(State):\r
        def __init__(self, machine):\r
            self.machine = machine\r
\r
        def insertCoin(self):\r
            return "Coin already inserted"\r
\r
        def ejectCoin(self):\r
            self.machine.setState(self.machine.noCoinState)\r
            return "Coin ejected"\r
\r
        def dispense(self):\r
            self.machine.setState(self.machine.noCoinState)\r
            return "Item dispensed"\r
\r
    class VendingMachine:\r
        def __init__(self):\r
            self.noCoinState = NoCoinState(self)\r
            self.hasCoinState = HasCoinState(self)\r
            self.state = self.noCoinState\r
\r
        def setState(self, state):\r
            self.state = state\r
\r
        def insertCoin(self):\r
            return self.state.insertCoin()\r
\r
        def ejectCoin(self):\r
            return self.state.ejectCoin()\r
\r
        def dispense(self):\r
            return self.state.dispense()\r
\r
    vendingMachine = VendingMachine()\r
    vmResult1 = vendingMachine.dispense()\r
    vmResult2 = vendingMachine.insertCoin()\r
    vmResult3 = vendingMachine.dispense()\r
    stateResult = (vmResult1, vmResult2, vmResult3)\r
    stateResult\r
  exercise:\r
    prompt: 상태 패턴 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      from abc import ABC, abstractmethod\r
\r
      class State(ABC):\r
          @abstractmethod\r
          def insertCoin(self):\r
              pass\r
\r
          @abstractmethod\r
          def ejectCoin(self):\r
              pass\r
\r
          @abstractmethod\r
          def dispense(self):\r
              pass\r
\r
      class NoCoinState(State):\r
          def __init__(self, machine):\r
              self.machine = machine\r
\r
          def insertCoin(self):\r
              self.machine.setState(self.machine.hasCoinState)\r
              return "Coin inserted"\r
\r
          def ejectCoin(self):\r
              return "No coin to eject"\r
\r
          def dispense(self):\r
              return "Insert coin first"\r
\r
      class HasCoinState(State):\r
          def __init__(self, machine):\r
              self.machine = machine\r
\r
          def insertCoin(self):\r
              return "Coin already inserted"\r
\r
          def ejectCoin(self):\r
              self.machine.setState(self.machine.noCoinState)\r
              return "Coin ejected"\r
\r
          def dispense(self):\r
              self.machine.setState(self.machine.noCoinState)\r
              return "Item dispensed"\r
\r
      class VendingMachine:\r
          def __init__(self):\r
              self.noCoinState = NoCoinState(self)\r
              self.hasCoinState = HasCoinState(self)\r
              self.state = self.noCoinState\r
\r
          def setState(self, state):\r
              self.state = state\r
\r
          def insertCoin(self):\r
              return self.state.insertCoin()\r
\r
          def ejectCoin(self):\r
              return self.state.ejectCoin()\r
\r
          def dispense(self):\r
              return self.state.dispense()\r
\r
      vendingMachine = VendingMachine()\r
      vmResult1 = vendingMachine.dispense()\r
      vmResult2 = vendingMachine.insertCoin()\r
      vmResult3 = vendingMachine.dispense()\r
      stateResult = (vmResult1, vmResult2, vmResult3)\r
      stateResult\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 상태 패턴의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 상태 패턴 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: template_method_pattern\r
  title: 템플릿 메서드 패턴\r
  structuredPrimary: true\r
  subtitle: 알고리즘 골격 정의\r
  goal: 템플릿 메서드 패턴에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: 알고리즘 골격을 정의하고 일부 단계를 서브클래스에 위임\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    from abc import ABC, abstractmethod\r
\r
    class DataMiner(ABC):\r
        def mine(self, path):\r
            file = self.openFile(path)\r
            rawData = self.extractData(file)\r
            data = self.parseData(rawData)\r
            analysis = self.analyzeData(data)\r
            return self.sendReport(analysis)\r
\r
        @abstractmethod\r
        def openFile(self, path):\r
            pass\r
\r
        @abstractmethod\r
        def extractData(self, file):\r
            pass\r
\r
        def parseData(self, rawData):\r
            return rawData.split(",")\r
\r
        def analyzeData(self, data):\r
            return f"Analyzed {len(data)} items"\r
\r
        def sendReport(self, analysis):\r
            return f"Report: {analysis}"\r
\r
    class PDFMiner(DataMiner):\r
        def openFile(self, path):\r
            return f"PDF:{path}"\r
\r
        def extractData(self, file):\r
            return "pdf,data,extracted"\r
\r
    class CSVMiner(DataMiner):\r
        def openFile(self, path):\r
            return f"CSV:{path}"\r
\r
        def extractData(self, file):\r
            return "csv,data,extracted,more"\r
\r
    pdfMiner = PDFMiner()\r
    csvMiner = CSVMiner()\r
    pdfReport = pdfMiner.mine("doc.pdf")\r
    csvReport = csvMiner.mine("data.csv")\r
    templateResult = (pdfReport, csvReport)\r
    templateResult\r
  exercise:\r
    prompt: 템플릿 메서드 패턴 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      from abc import ABC, abstractmethod\r
\r
      class DataMiner(ABC):\r
          def mine(self, path):\r
              file = self.openFile(path)\r
              rawData = self.extractData(file)\r
              data = self.parseData(rawData)\r
              analysis = self.analyzeData(data)\r
              return self.sendReport(analysis)\r
\r
          @abstractmethod\r
          def openFile(self, path):\r
              pass\r
\r
          @abstractmethod\r
          def extractData(self, file):\r
              pass\r
\r
          def parseData(self, rawData):\r
              return rawData.split(",")\r
\r
          def analyzeData(self, data):\r
              return f"Analyzed {len(data)} items"\r
\r
          def sendReport(self, analysis):\r
              return f"Report: {analysis}"\r
\r
      class PDFMiner(DataMiner):\r
          def openFile(self, path):\r
              return f"PDF:{path}"\r
\r
          def extractData(self, file):\r
              return "pdf,data,extracted"\r
\r
      class CSVMiner(DataMiner):\r
          def openFile(self, path):\r
              return f"CSV:{path}"\r
\r
          def extractData(self, file):\r
              return "csv,data,extracted,more"\r
\r
      pdfMiner = PDFMiner()\r
      csvMiner = CSVMiner()\r
      pdfReport = pdfMiner.mine("doc.pdf")\r
      csvReport = csvMiner.mine("data.csv")\r
      templateResult = (pdfReport, csvReport)\r
      templateResult\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 템플릿 메서드 패턴의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 템플릿 메서드 패턴 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: chain_of_responsibility\r
  title: 책임 연쇄 패턴\r
  structuredPrimary: true\r
  subtitle: 핸들러 체인\r
  goal: 책임 연쇄 패턴에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: 요청을 처리할 수 있는 핸들러를 연쇄적으로 연결\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    from abc import ABC, abstractmethod\r
\r
    class Handler(ABC):\r
        def __init__(self):\r
            self._next = None\r
\r
        def setNext(self, handler):\r
            self._next = handler\r
            return handler\r
\r
        @abstractmethod\r
        def handle(self, request):\r
            pass\r
\r
    class AuthHandler(Handler):\r
        def handle(self, request):\r
            if request.get("authenticated"):\r
                if self._next:\r
                    return self._next.handle(request)\r
                return "Authorized"\r
            return "Authentication failed"\r
\r
    class RoleHandler(Handler):\r
        def handle(self, request):\r
            if request.get("role") == "admin":\r
                if self._next:\r
                    return self._next.handle(request)\r
                return "Admin access granted"\r
            return "Insufficient permissions"\r
\r
    class LogHandler(Handler):\r
        def handle(self, request):\r
            result = f"Logged: {request.get('action')}"\r
            if self._next:\r
                return result + " -> " + self._next.handle(request)\r
            return result\r
\r
    authHandler = AuthHandler()\r
    roleHandler = RoleHandler()\r
    logHandler = LogHandler()\r
    authHandler.setNext(roleHandler).setNext(logHandler)\r
    chainReq1 = {"authenticated": True, "role": "admin", "action": "delete"}\r
    chainReq2 = {"authenticated": True, "role": "user", "action": "read"}\r
    chainReq3 = {"authenticated": False, "role": "admin", "action": "create"}\r
    chainResult1 = authHandler.handle(chainReq1)\r
    chainResult2 = authHandler.handle(chainReq2)\r
    chainResult3 = authHandler.handle(chainReq3)\r
    chainResult = (chainResult1, chainResult2, chainResult3)\r
    chainResult\r
  exercise:\r
    prompt: 책임 연쇄 패턴 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      from abc import ABC, abstractmethod\r
\r
      class Handler(ABC):\r
          def __init__(self):\r
              self._next = None\r
\r
          def setNext(self, handler):\r
              self._next = handler\r
              return handler\r
\r
          @abstractmethod\r
          def handle(self, request):\r
              pass\r
\r
      class AuthHandler(Handler):\r
          def handle(self, request):\r
              if request.get("authenticated"):\r
                  if self._next:\r
                      return self._next.handle(request)\r
                  return "Authorized"\r
              return "Authentication failed"\r
\r
      class RoleHandler(Handler):\r
          def handle(self, request):\r
              if request.get("role") == "admin":\r
                  if self._next:\r
                      return self._next.handle(request)\r
                  return "Admin access granted"\r
              return "Insufficient permissions"\r
\r
      class LogHandler(Handler):\r
          def handle(self, request):\r
              result = f"Logged: {request.get('action')}"\r
              if self._next:\r
                  return result + " -> " + self._next.handle(request)\r
              return result\r
\r
      authHandler = AuthHandler()\r
      roleHandler = RoleHandler()\r
      logHandler = LogHandler()\r
      authHandler.setNext(roleHandler).setNext(logHandler)\r
      chainReq1 = {"authenticated": True, "role": "admin", "action": "delete"}\r
      chainReq2 = {"authenticated": True, "role": "user", "action": "read"}\r
      chainReq3 = {"authenticated": False, "role": "admin", "action": "create"}\r
      chainResult1 = authHandler.handle(chainReq1)\r
      chainResult2 = authHandler.handle(chainReq2)\r
      chainResult3 = authHandler.handle(chainReq3)\r
      chainResult = (chainResult1, chainResult2, chainResult3)\r
      chainResult\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 책임 연쇄 패턴의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 책임 연쇄 패턴 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: workflow_validation\r
  title: 실무 행동 패턴 선택 루프\r
  structuredPrimary: true\r
  subtitle: 요구사항 → 패턴 선택 → 오류 확인 → 검증\r
  goal: 실무 행동 패턴 선택 루프에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: |-\r
    행동 패턴은 이름을 맞히는 문제가 아니라 변경 요구를 어디에 격리할지 정하는 도구입니다. 주문 처리 업무에서 알림은 옵저버, 배송비 정책은 전략, 상태 변경과 되돌리기는 커맨드가 어울립니다. 실행 전에 어떤 변경이 어디로 흘러갈지 예측하고, 빠진 정책 같은 오류를 검증해야 합니다.\r
\r
    패턴은 코드가 멋져 보이게 하는 이름표가 아닙니다. 변경 요구가 들어왔을 때 수정할 위치가 줄고, 오류 조건을 검증하기 쉬워졌을 때 좋은 설계입니다.\r
  snippet: |-\r
    class OrderEventBus:\r
        def __init__(self):\r
            self.subscribers = {}\r
\r
        def subscribe(self, eventName, handler):\r
            self.subscribers.setdefault(eventName, []).append(handler)\r
\r
        def publish(self, eventName, payload):\r
            results = []\r
            for handler in self.subscribers.get(eventName, []):\r
                results.append(handler(payload))\r
            return results\r
\r
    eventBus = OrderEventBus()\r
    notificationLog = []\r
    auditLog = []\r
\r
    eventBus.subscribe(\r
        "paid",\r
        lambda order: notificationLog.append(f"send message to {order['customer']}"),\r
    )\r
    eventBus.subscribe(\r
        "paid",\r
        lambda order: auditLog.append(f"audit {order['id']}"),\r
    )\r
\r
    order = {"id": "O-1001", "customer": "Mina", "amount": 120000}\r
    observerResults = eventBus.publish("paid", order)\r
    assert notificationLog == ["send message to Mina"]\r
    assert auditLog == ["audit O-1001"]\r
    assert observerResults == [None, None]\r
  exercise:\r
    prompt: 실무 행동 패턴 선택 루프 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      class OrderEventBus:\r
          def __init__(self):\r
              self.subscribers = {}\r
\r
          def subscribe(self, eventName, handler):\r
              self.subscribers.setdefault(eventName, []).append(handler)\r
\r
          def publish(self, eventName, payload):\r
              results = []\r
              for handler in self.subscribers.get(eventName, []):\r
                  results.append(handler(payload))\r
              return results\r
\r
      eventBus = OrderEventBus()\r
      notificationLog = []\r
      auditLog = []\r
\r
      eventBus.subscribe(\r
          "paid",\r
          lambda order: notificationLog.append(f"send message to {order['customer']}"),\r
      )\r
      eventBus.subscribe(\r
          "paid",\r
          lambda order: auditLog.append(f"audit {order['id']}"),\r
      )\r
\r
      order = {"id": "O-1001", "customer": "Mina", "amount": 120000}\r
      observerResults = eventBus.publish("paid", order)\r
      assert notificationLog == ["send message to Mina"]\r
      assert auditLog == ["audit O-1001"]\r
      assert observerResults == [None, None]\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 실무 행동 패턴 선택 루프의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 실무 행동 패턴 선택 루프 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: practice\r
  title: 종합 복습\r
  structuredPrimary: true\r
  subtitle: 행동 패턴 마스터하기\r
  goal: 종합 복습에서 추상화 패턴 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: Day 22에서 배운 행동 디자인 패턴을 난이도별로 복습합니다. 옵저버 패턴은 이벤트 시스템, 전략 패턴은 알고리즘 교체, 커맨드 패턴은 실행 취소/재실행에\r
    핵심입니다. 상태 패턴은 복잡한 상태 전이를 객체로 캡슐화하고, 템플릿 메서드는 알고리즘의 골격을 정의합니다. 🟢 기본 문제로 각 패턴의 핵심 인터페이스를 구현하고, 🟡 응용\r
    문제로 여러 패턴을 조합해봅니다. 🔴 심화 문제에서는 GUI 프레임워크, 게임 엔진 등에서 사용되는 복합 행동 패턴을 직접 설계합니다. 행동 패턴은 객체 간 책임 분배와 통신\r
    방식을 결정하는 핵심 도구입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    class NewsAgency:\r
        def __init__(self):\r
            self.subscribers = []\r
            self.latestNews = None\r
\r
        def subscribe(self, subscriber):\r
            self.subscribers.append(subscriber)\r
\r
        def unsubscribe(self, subscriber):\r
            self.subscribers.remove(subscriber)\r
\r
        def publish(self, news):\r
            self.latestNews = news\r
            for subscriber in self.subscribers:\r
                subscriber.receive(news)\r
\r
    class NewsReader:\r
        def __init__(self, name):\r
            self.name = name\r
            self.news = []\r
\r
        def receive(self, news):\r
            self.news.append(news)\r
\r
    agency = NewsAgency()\r
    reader1 = NewsReader("Alice")\r
    reader2 = NewsReader("Bob")\r
    agency.subscribe(reader1)\r
    agency.subscribe(reader2)\r
    agency.publish("Breaking: New discovery!")\r
    ex1Result = (reader1.news, reader2.news)\r
    ex1Result\r
  exercise:\r
    prompt: 종합 복습 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      class NewsAgency:\r
          def __init__(self):\r
              self.subscribers = []\r
              self.latestNews = None\r
\r
          def subscribe(self, subscriber):\r
              self.subscribers.append(subscriber)\r
\r
          def unsubscribe(self, subscriber):\r
              self.subscribers.remove(subscriber)\r
\r
          def publish(self, news):\r
              self.latestNews = news\r
              for subscriber in self.subscribers:\r
                  subscriber.receive(news)\r
\r
      class NewsReader:\r
          def __init__(self, name):\r
              self.name = name\r
              self.news = []\r
\r
          def receive(self, news):\r
              self.news.append(news)\r
\r
      agency = NewsAgency()\r
      reader1 = NewsReader("Alice")\r
      reader2 = NewsReader("Bob")\r
      agency.subscribe(reader1)\r
      agency.subscribe(reader2)\r
      agency.publish("Breaking: New discovery!")\r
      ex1Result = (reader1.news, reader2.news)\r
      ex1Result\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:
    type: noError
    noError: 종합 복습의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 종합 복습 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
assessment:
  masteryVariants:
  - id: 22_behavior_patterns-pricing-strategy-mastery
    mode: mastery
    unseen: false
    sourceSectionIds:
    - strategy_pattern
    - state_pattern
    - workflow_validation
    title: 주문 할인 전략 교체하기
    subtitle: pricing strategy pattern
    goal: price_order(order, strategy_name)를 완성해 전략 이름에 따라 할인 계산을 교체하고 같은 반환 계약을 유지한다.
    why: 행동 패턴의 핵심은 분기문을 없애는 미학이 아니라, 바뀌는 행동을 안전하게 교체하고 결과 계약을 흔들지 않는 것입니다.
    explanation: standard는 할인 0, vip는 10퍼센트 할인, bulk는 수량이 10개 이상이면 15퍼센트 할인을 적용하세요.
    tips:
    - 전략 함수는 같은 입력과 같은 반환 형태를 유지해야 서로 교체할 수 있습니다.
    - 알 수 없는 전략 이름은 ValueError로 거부해 잘못된 설정을 조용히 넘기지 않습니다.
    exercise:
      prompt: price_order(order, strategy_name)를 완성해 subtotal, discount, total, strategy를 반환하세요.
      starterCode: |-
        def price_order(order, strategy_name):
            raise NotImplementedError
      solution: |-
        def price_order(order, strategy_name):
            def standard(order, subtotal):
                return 0

            def vip(order, subtotal):
                return round(subtotal * 0.10)

            def bulk(order, subtotal):
                return round(subtotal * 0.15) if order["quantity"] >= 10 else 0

            strategies = {
                "standard": standard,
                "vip": vip,
                "bulk": bulk,
            }
            if strategy_name not in strategies:
                raise ValueError("unknown pricing strategy")
            subtotal = order["unitPrice"] * order["quantity"]
            discount = strategies[strategy_name](order, subtotal)
            return {
                "subtotal": subtotal,
                "discount": discount,
                "total": subtotal - discount,
                "strategy": strategy_name,
            }
      hints:
      - 전략 함수들을 딕셔너리에 넣으면 이름으로 행동을 교체할 수 있습니다.
      - 모든 전략이 같은 의미의 discount 값을 반환해야 결과 조립이 단순해집니다.
    check:
      id: python.advanced.behavior-patterns.pricing-strategy.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.behavior-patterns.empty.behavior.v1.fixture
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
        entry: price_order
        cases:
        - id: applies-vip-discount
          arguments:
          - value:
              unitPrice: 12000
              quantity: 3
          - value: vip
          expectedReturn:
            subtotal: 36000
            discount: 3600
            total: 32400
            strategy: vip
        - id: applies-bulk-discount-only-above-threshold
          arguments:
          - value:
              unitPrice: 5000
              quantity: 12
          - value: bulk
          expectedReturn:
            subtotal: 60000
            discount: 9000
            total: 51000
            strategy: bulk
        - id: rejects-unknown-strategy
          arguments:
          - value:
              unitPrice: 1000
              quantity: 1
          - value: mystery
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: 22_behavior_patterns-command-stack-transfer
    mode: transfer
    unseen: true
    sourceSectionIds:
    - command_pattern
    - state_pattern
    - chain_of_responsibility
    title: 숫자 편집 명령과 undo 스택 실행하기
    subtitle: command pattern transfer
    goal: run_command_stack(commands)를 완성해 add, multiply, undo 명령을 실행하고 되돌린 명령을 기록한다.
    why: 커맨드 패턴은 버튼 클릭 예제가 아니라 실행 기록, 재실행, 취소가 필요한 자동화에서 바로 쓰입니다.
    explanation: value는 0에서 시작합니다. add와 multiply는 실행 기록에 쌓고, undo는 마지막 실행 명령을 되돌립니다. 되돌릴 명령이 없으면 값을 유지하세요.
    tips:
    - undo를 구현하려면 실행한 명령과 이전 값을 함께 저장하는 편이 안전합니다.
    - 명령이 늘어나도 반환 계약은 value, history, undone으로 유지하세요.
    exercise:
      prompt: run_command_stack(commands)를 완성해 최종 value, 실행 history, undone 목록을 반환하세요.
      starterCode: |-
        def run_command_stack(commands):
            raise NotImplementedError
      solution: |-
        def run_command_stack(commands):
            value = 0
            history = []
            undone = []
            for command in commands:
                action = command["action"]
                if action == "add":
                    previous = value
                    value += command["amount"]
                    history.append({"action": "add", "previous": previous, "amount": command["amount"]})
                elif action == "multiply":
                    previous = value
                    value *= command["factor"]
                    history.append({"action": "multiply", "previous": previous, "factor": command["factor"]})
                elif action == "undo":
                    if history:
                        last = history.pop()
                        value = last["previous"]
                        undone.append(last["action"])
                else:
                    raise ValueError("unknown command")
            return {
                "value": value,
                "history": [item["action"] for item in history],
                "undone": undone,
            }
      hints:
      - undo는 현재 연산을 역계산하기보다 이전 값을 저장해두는 방식이 더 단순합니다.
      - history에는 undo 가능한 명령만 넣어야 합니다.
    check:
      id: python.advanced.behavior-patterns.command-stack.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.behavior-patterns.empty.behavior.v1.fixture
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
        entry: run_command_stack
        cases:
        - id: executes-and-undoes-last-commands
          arguments:
          - value:
            - action: add
              amount: 5
            - action: multiply
              factor: 3
            - action: add
              amount: 2
            - action: undo
            - action: add
              amount: 1
          expectedReturn:
            value: 16
            history:
            - add
            - multiply
            - add
            undone:
            - add
        - id: rejects-unknown-command
          arguments:
          - value:
            - action: divide
              amount: 2
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: 22_behavior_patterns-choice-retrieval
    mode: retrieval
    unseen: true
    sourceSectionIds:
    - observer_pattern
    - strategy_pattern
    - command_pattern
    - state_pattern
    - template_method_pattern
    - chain_of_responsibility
    title: 행동 패턴 선택 기준 회상하기
    subtitle: behavioral pattern recall
    goal: choose_behavior_pattern(need)를 완성해 요구사항별 패턴과 판단 기준을 반환한다.
    why: 행동 패턴은 객체 사이의 대화 방식과 책임 이동을 설계하는 언어입니다. 이름보다 이벤트, 교체 가능성, 취소, 상태 전이, 처리 체인을 구분해야 합니다.
    explanation: event-broadcast, switch-algorithm, undoable-action, lifecycle-state, fixed-algorithm-skeleton, routed-handlers 상황별 패턴을 선택하세요.
    tips:
    - 옵저버는 한 이벤트를 여러 구독자에게 알릴 때 자연스럽습니다.
    - 책임 연쇄는 처리자가 순서대로 기회를 가져야 할 때 씁니다.
    exercise:
      prompt: choose_behavior_pattern(need)를 완성해 pattern, signal, risk를 반환하세요.
      starterCode: |-
        def choose_behavior_pattern(need):
            raise NotImplementedError
      solution: |-
        def choose_behavior_pattern(need):
            table = {
                "event-broadcast": {
                    "pattern": "observer",
                    "signal": "one event fan-outs to many listeners",
                    "risk": "listener order and failures must be visible",
                },
                "switch-algorithm": {
                    "pattern": "strategy",
                    "signal": "same input contract needs interchangeable behavior",
                    "risk": "too many tiny strategies can hide simple branches",
                },
                "undoable-action": {
                    "pattern": "command",
                    "signal": "actions need history, retry, or undo",
                    "risk": "commands must capture enough state to reverse safely",
                },
                "lifecycle-state": {
                    "pattern": "state",
                    "signal": "allowed behavior depends on current status",
                    "risk": "transitions must be explicit",
                },
                "fixed-algorithm-skeleton": {
                    "pattern": "template-method",
                    "signal": "steps are fixed but details vary by subclass",
                    "risk": "inheritance can be heavier than composition",
                },
                "routed-handlers": {
                    "pattern": "chain-of-responsibility",
                    "signal": "ordered handlers may accept or pass a request",
                    "risk": "unhandled requests need a clear fallback",
                },
            }
            if need not in table:
                raise ValueError("unknown behavior need")
            return table[need]
      hints:
      - 이벤트 전파, 알고리즘 교체, 실행 기록은 서로 다른 변화 축입니다.
      - 패턴을 고를 때 failure visibility도 함께 말해야 합니다.
    check:
      id: python.advanced.behavior-patterns.choice.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.advanced.behavior-patterns.empty.behavior.v1.fixture
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
        entry: choose_behavior_pattern
        cases:
        - id: recalls-observer-for-broadcast
          arguments:
          - value: event-broadcast
          expectedReturn:
            pattern: observer
            signal: one event fan-outs to many listeners
            risk: listener order and failures must be visible
        - id: recalls-command-for-undo
          arguments:
          - value: undoable-action
          expectedReturn:
            pattern: command
            signal: actions need history, retry, or undo
            risk: commands must capture enough state to reverse safely
        - id: rejects-unknown-need
          arguments:
          - value: pattern-soup
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 24
`;export{e as default};