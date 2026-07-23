var e=`meta:\r
  id: 01_math\r
  title: math - 수학 함수\r
  category: builtins\r
  tags:\r
  - math\r
  - 수학\r
  - 계산\r
  - 삼각함수\r
  seo:\r
    title: 파이썬 math 모듈 완전 정복\r
    description: math 모듈의 삼각함수, 로그, 지수, 반올림 등 모든 함수를 실전 예제로 배웁니다.\r
    keywords:\r
    - math\r
    - 수학함수\r
    - sin\r
    - cos\r
    - log\r
    - sqrt\r
    - 파이썬수학\r
intro:\r
  emoji: 🔢\r
  points:\r
  - 삼각함수와 로그 계산\r
  - 반올림과 절댓값\r
  - 수학 상수 활용\r
  - 실전 과학 계산\r
  direction: math 수학 함수에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.\r
  benefits:\r
  - 작은 샘플 입력 확인 후 모듈 함수 호출에 맞는 코드 입력을 고릅니다.\r
  - math 수학 함수 결과를 반환값, stdout, 객체 상태 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 표준 라이브러리 유틸리티에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: math 모듈 불러오기 입력 확인\r
      detail: 입력 기준(작은 샘플 입력)과 필요한 조건을 먼저 고정합니다.\r
    - label: 기본 수학 함수 처리 실행\r
      detail: 모듈 함수 호출 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 삼각함수 결과 검증\r
      detail: 반환값, stdout, 객체 상태 기준으로 실행 결과를 비교합니다.\r
    - label: math 수학 함수 재사용\r
      detail: 완성 코드를 표준 라이브러리 유틸리티에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 표준 라이브러리 환경\r
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: math 수학 함수 실행\r
      detail: 셀을 실행해 반환값, stdout, 객체 상태와 예외 상태를 확인합니다.\r
    - label: math 수학 함수 완료\r
      detail: 검증된 코드를 표준 라이브러리 유틸리티로 남깁니다.\r
sections:\r
- id: module_import\r
  title: math 모듈 불러오기\r
  structuredPrimary: true\r
  subtitle: ⚠️ 가장 먼저 실행하세요\r
  goal: math 모듈 불러오기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표준 라이브러리는 외부 의존성 없이 파일, 시간, 문자열, 직렬화 같은 업무 코드를 구성하는 기반입니다.\r
  explanation: |-\r
    math는 파이썬 표준 수학 라이브러리입니다. 삼각함수, 로그, 지수, 반올림 등 다양한 수학 함수를 제공합니다. 별도 설치 없이 import만으로 사용할 수 있습니다.\r
\r
    이 섹션을 먼저 실행하면 아래 모든 예제에서 math 모듈을 사용할 수 있습니다.\r
  snippet: |-\r
    import math\r
\r
    # 정상 로드 확인\r
    math.pi\r
  exercise:\r
    prompt: math 모듈 불러오기 예제에서 입력값을 바꾸고 마지막 확인 값이 달라지는지 확인하세요.\r
    starterCode: |-\r
      import math\r
\r
      # 정상 로드 확인\r
      math.pi\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: math 모듈 불러오기의 수정 코드가 모듈 함수 호출 단계의 마지막 확인 값까지 도달해야 합니다.\r
    resultCheck: math 모듈 불러오기 실행 결과가 반환값, stdout, 객체 상태 기준으로 바꾼 입력값을 반영해야 합니다.\r
- id: basic_functions\r
  title: 기본 수학 함수\r
  structuredPrimary: true\r
  subtitle: 자주 사용하는 핵심 함수\r
  goal: 기본 수학 함수에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    math 모듈은 파이썬의 표준 수학 라이브러리입니다. 제곱근, 거듭제곱, 절댓값 등 기본적인 수학 계산부터 과학 계산까지 다양한 함수를 제공합니다. 모든 함수는 부동소수점 연산을 수행하며, 정확하고 빠른 계산을 보장합니다.\r
\r
    sqrt()는 음수에 사용하면 ValueError가 발생합니다. 복소수 계산은 cmath 모듈을 사용하세요.\r
  snippet: |-\r
    squareRoot = math.sqrt(16)\r
    squareRoot\r
  exercise:\r
    prompt: 기본 수학 함수 예제에서 \`squareRoot\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      squareRoot = math.sqrt(16)\r
      squareRoot\r
    hints:\r
    - 바꿀 지점은 \`squareRoot = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`squareRoot\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 기본 수학 함수에서 \`squareRoot\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 기본 수학 함수 실행 뒤 \`squareRoot\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: trigonometric\r
  title: 삼각함수\r
  structuredPrimary: true\r
  subtitle: 각도와 라디안 계산\r
  goal: 삼각함수에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    삼각함수는 각도를 다루는 계산에 필수적입니다. math 모듈의 삼각함수는 라디안 단위를 사용하므로, 도(degree)를 라디안으로 변환해야 합니다. sin, cos, tan 함수와 역삼각함수 asin, acos, atan을 제공합니다.\r
\r
    파이썬의 삼각함수는 라디안을 사용합니다. 도 단위는 radians()로 변환하세요.\r
  snippet: |-\r
    angleInRadians = math.radians(45)\r
    angleInRadians\r
  exercise:\r
    prompt: 삼각함수 예제에서 \`angleInRadians\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      angleInRadians = math.radians(45)\r
      angleInRadians\r
    hints:\r
    - 바꿀 지점은 \`angleInRadians = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`angleInRadians\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 삼각함수에서 \`angleInRadians\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 삼각함수 실행 뒤 \`angleInRadians\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: logarithmic\r
  title: 로그와 지수\r
  structuredPrimary: true\r
  subtitle: 지수 및 로그 함수\r
  goal: 로그와 지수에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    로그와 지수 함수는 과학 계산, 금융, 데이터 분석에서 자주 사용됩니다. math.log()는 자연로그(밑이 e), math.log10()은 상용로그(밑이 10)를 계산합니다. math.exp()는 e의 거듭제곱을 계산합니다.\r
\r
    log(x, base)로 임의의 밑을 지정할 수 있습니다. 예: math.log(8, 2) = 3\r
  snippet: |-\r
    exponential = math.exp(1)\r
    exponential\r
  exercise:\r
    prompt: 로그와 지수 예제에서 \`exponential\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      exponential = math.exp(1)\r
      exponential\r
    hints:\r
    - 바꿀 지점은 \`exponential = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`exponential\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 로그와 지수에서 \`exponential\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 로그와 지수 실행 뒤 \`exponential\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: rounding\r
  title: 반올림과 정수 변환\r
  structuredPrimary: true\r
  subtitle: 올림, 내림, 반올림\r
  goal: 반올림과 정수 변환에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    수를 정수로 변환하는 방법은 여러 가지입니다. ceil()은 올림, floor()는 내림, trunc()는 소수점 제거를 수행합니다. round()는 내장 함수로 반올림하지만, math.modf()는 정수부와 소수부를 분리합니다.\r
\r
    음수에서 ceil()과 floor()의 동작에 주의하세요. ceil(-3.2) = -3, floor(-3.2) = -4\r
  snippet: |-\r
    ceilingValue = math.ceil(3.2)\r
    ceilingValue\r
  exercise:\r
    prompt: 반올림과 정수 변환 예제에서 \`ceilingValue\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      ceilingValue = math.ceil(3.2)\r
      ceilingValue\r
    hints:\r
    - 바꿀 지점은 \`ceilingValue = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`ceilingValue\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 반올림과 정수 변환에서 \`ceilingValue\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 반올림과 정수 변환 실행 뒤 \`ceilingValue\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: constants\r
  title: 수학 상수\r
  structuredPrimary: true\r
  subtitle: 파이와 자연상수\r
  goal: 수학 상수에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    math 모듈은 중요한 수학 상수를 제공합니다. math.pi는 원주율(3.141592...), math.e는 자연상수(2.718281...), math.tau는 2π, math.inf는 무한대를 나타냅니다. 이 상수들은 과학 계산에 필수적입니다.\r
\r
    math.tau는 2π로, 라디안 계산에서 더 직관적입니다. 한 바퀴는 tau 라디안입니다.\r
  snippet: |-\r
    radius = 5\r
    circleArea = math.pi * radius ** 2\r
    circleArea\r
  exercise:\r
    prompt: 수학 상수 예제에서 \`radius\`, \`circleArea\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      radius = 5\r
      circleArea = math.pi * radius ** 2\r
      circleArea\r
    hints:\r
    - 바꿀 지점은 \`radius = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`radius\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 수학 상수에서 \`radius\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 수학 상수 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: practical\r
  title: 실전 활용\r
  structuredPrimary: true\r
  subtitle: 실무 계산 예제\r
  goal: 실전 활용에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    math 모듈을 실전에서 활용하는 예제를 살펴봅니다. 거리 계산, 각도 변환, 통계 계산 등 다양한 분야에서 수학 함수를 조합하여 복잡한 문제를 해결할 수 있습니다.\r
\r
    hypot()는 여러 인자를 받을 수 있습니다. math.hypot(3, 4, 5)로 3차원 거리를 계산할 수 있습니다.\r
  snippet: |-\r
    hypotenuse = math.hypot(3, 4)\r
    hypotenuse\r
  exercise:\r
    prompt: 실전 활용 예제에서 \`hypotenuse\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      hypotenuse = math.hypot(3, 4)\r
      hypotenuse\r
    hints:\r
    - 바꿀 지점은 \`hypotenuse = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`hypotenuse\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 실전 활용에서 \`hypotenuse\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 실전 활용 실행 뒤 \`hypotenuse\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: workflow_validation\r
  title: '검증 루프: 업무 계산 리포트'\r
  structuredPrimary: true\r
  subtitle: 오차 허용, 단위 확인, 운영 기준 계산\r
  goal: '검증 루프: 업무 계산 리포트에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.'\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: |-\r
    실무 계산에서는 값이 출력되는 것보다 검증 기준이 더 중요합니다. 부동소수점 결과는 math.isclose()로 비교하고, 각도 단위처럼 자주 틀리는 입력은 일부러 깨뜨려 보면서 검증합니다.\r
\r
    변주 실험\r
    거리 계산을 2차원 좌표에서 3차원 좌표로 바꾸고, \`math.hypot(x, y, z)\` 결과가 직접 제곱합을 계산한 값과 같은지 비교하세요.\r
  tips:\r
  - 변주 실험 거리 계산을 2차원 좌표에서 3차원 좌표로 바꾸고, \`math.hypot(x, y, z)\` 결과가 직접 제곱합을 계산한 값과 같은지 비교하세요.\r
  snippet: |-\r
    sites = [\r
        {"name": "warehouseA", "x": 0, "y": 0, "radius": 4},\r
        {"name": "warehouseB", "x": 3, "y": 4, "radius": 6},\r
        {"name": "warehouseC", "x": -5, "y": 12, "radius": 3},\r
    ]\r
\r
    def buildSiteMathReport(siteRows):\r
        report = []\r
        for site in siteRows:\r
            distance = math.hypot(site["x"], site["y"])\r
            coverageArea = math.pi * site["radius"] ** 2\r
            report.append({\r
                "name": site["name"],\r
                "distanceFromOrigin": distance,\r
                "coverageArea": coverageArea,\r
            })\r
        return report\r
\r
    siteReport = buildSiteMathReport(sites)\r
\r
    assert math.isclose(siteReport[1]["distanceFromOrigin"], 5.0)\r
    assert math.isclose(siteReport[2]["distanceFromOrigin"], 13.0)\r
    assert math.isclose(siteReport[0]["coverageArea"], 50.26548245743669)\r
\r
    siteReport\r
  exercise:\r
    prompt: '검증 루프: 업무 계산 리포트 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.'\r
    starterCode: |-\r
      sites = [\r
          {"name": "warehouseA", "x": 0, "y": 0, "radius": 4},\r
          {"name": "warehouseB", "x": 3, "y": 4, "radius": 6},\r
          {"name": "warehouseC", "x": -5, "y": 12, "radius": 3},\r
      ]\r
\r
      def buildSiteMathReport(siteRows):\r
          report = []\r
          for site in siteRows:\r
              distance = math.hypot(site["x"], site["y"])\r
              coverageArea = math.pi * site["radius"] ** 2\r
              report.append({\r
                  "name": site["name"],\r
                  "distanceFromOrigin": distance,\r
                  "coverageArea": coverageArea,\r
              })\r
          return report\r
\r
      siteReport = buildSiteMathReport(sites)\r
\r
      assert math.isclose(siteReport[1]["distanceFromOrigin"], 5.0)\r
      assert math.isclose(siteReport[2]["distanceFromOrigin"], 13.0)\r
      assert math.isclose(siteReport[0]["coverageArea"], 50.26548245743669)\r
\r
      siteReport\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: '검증 루프: 업무 계산 리포트의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.'\r
    resultCheck: '검증 루프: 업무 계산 리포트 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.'\r
- id: practice\r
  title: math 모듈 종합 복습\r
  structuredPrimary: true\r
  subtitle: 수학 함수 마스터하기\r
  goal: math 모듈 종합 복습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: math 모듈의 다양한 함수를 활용하는 연습 문제입니다. 🟢 기본 미션부터 시작하여 🔴 심화 미션까지 도전해보세요.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    sqrtValue = math.sqrt(25)\r
    sqrtValue\r
  exercise:\r
    prompt: math 모듈 종합 복습 예제에서 \`sqrtValue\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      sqrtValue = math.sqrt(25)\r
      sqrtValue\r
    hints:\r
    - 바꿀 지점은 \`sqrtValue = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`sqrtValue\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:
    type: noError
    noError: math 모듈 종합 복습에서 \`sqrtValue\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: math 모듈 종합 복습 실행 뒤 \`sqrtValue\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.
assessment:
  masteryVariants:
  - id: 01_math-circle-summary-mastery
    mode: mastery
    unseen: false
    sourceSectionIds:
    - basic_functions
    - constants
    - practice
    title: 반지름으로 원 계산 요약 만들기
    subtitle: 예시 없이 핵심 규칙 완성
    goal: math.pi와 math.tau를 사용해 반지름 하나에서 지름, 면적, 둘레를 안정적으로 반환한다.
    why: 숫자가 출력되는지만 보면 계산식이 맞는지 알 수 없습니다. 여러 반지름에서 같은 계약이 성립해야 math 상수를 실제 계산에 쓸 수 있습니다.
    explanation: 함수 본문을 완성하면 격리된 Python Worker가 보이지 않던 여러 반지름으로 다시 호출합니다.
    tips:
    - 함수 이름과 매개변수는 바꾸지 말고 본문만 완성하세요.
    - 부동소수점 값은 문제에서 요구한 자리수로 반올림하세요.
    exercise:
      prompt: build_circle_summary(radius)가 지름, 면적, 둘레를 담은 dict를 반환하도록 완성하세요.
      starterCode: |-
        import math

        def build_circle_summary(radius):
            raise NotImplementedError
      solution: |-
        import math

        def build_circle_summary(radius):
            return {
                "diameter": radius * 2,
                "area": round(math.pi * radius ** 2, 2),
                "circumference": round(math.tau * radius, 2),
            }
      hints:
      - math.pi는 면적, math.tau는 둘레 계산에 바로 쓸 수 있습니다.
      - 반환 key 이름이 계약과 정확히 같아야 합니다.
    check:
      id: python.builtins.math.circle-summary.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.math.circle-summary.mastery.behavior.v1.fixture
      fixtureHash: sha256-EUE3dsIaRrkQcqkx52hMvHYX4XSUaDqh+aRH0f9shqI=
      fixture:
        directories: []
        env:
          LANG: C.UTF-8
          TZ: UTC
        files: []
        stdin: []
      packageAssets: []
      payload:
        entry: build_circle_summary
        cases:
        - id: radius-three
          arguments:
          - value: 3
          expectedReturn:
            diameter: 6
            area: 28.27
            circumference: 18.85
        - id: radius-half
          arguments:
          - value: 0.5
          expectedReturn:
            diameter: 1.0
            area: 0.79
            circumference: 3.14
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: 01_math-distance-cost-transfer
    mode: transfer
    unseen: true
    sourceSectionIds:
    - 01_math-circle-summary-mastery
    title: 거리 기반 배송 비용 계산하기
    subtitle: 처음 보는 조건에 개념 적용
    goal: math.hypot과 math.ceil을 조합해 좌표 거리와 청구 단위 비용을 계산한다.
    why: 같은 수학 함수를 업무 규칙에 옮겨야 계산 예제를 실제 자동화 판단으로 바꿀 수 있습니다.
    explanation: 숙달 검증이 저장된 뒤 자동으로 열리는 새 조건 과제입니다. 앞 예시가 아니라 입력과 반환 계약을 읽으세요.
    tips:
    - 거리 계산은 math.hypot으로 만들고 청구 단위는 math.ceil로 올림 처리하세요.
    - cost는 올림된 단위 수와 단가의 곱입니다.
    exercise:
      prompt: shipping_distance_cost(x, y, unit_cost)가 거리, 청구 단위, 비용을 담은 dict를 반환하도록 완성하세요.
      starterCode: |-
        import math

        def shipping_distance_cost(x, y, unit_cost):
            raise NotImplementedError
      solution: |-
        import math

        def shipping_distance_cost(x, y, unit_cost):
            distance = math.hypot(x, y)
            billable_units = math.ceil(distance)
            return {
                "distance": round(distance, 2),
                "billableUnits": billable_units,
                "cost": billable_units * unit_cost,
            }
      hints:
      - math.hypot(3, 4)는 5.0을 반환합니다.
      - 반환 key 이름과 대소문자가 검사 계약과 같아야 합니다.
    check:
      id: python.builtins.math.distance-cost.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.math.distance-cost.transfer.behavior.v1.fixture
      fixtureHash: sha256-EUE3dsIaRrkQcqkx52hMvHYX4XSUaDqh+aRH0f9shqI=
      fixture:
        directories: []
        env:
          LANG: C.UTF-8
          TZ: UTC
        files: []
        stdin: []
      packageAssets: []
      payload:
        entry: shipping_distance_cost
        cases:
        - id: five-units
          arguments:
          - value: 3
          - value: 4
          - value: 1200
          expectedReturn:
            distance: 5.0
            billableUnits: 5
            cost: 6000
        - id: thirteen-units
          arguments:
          - value: 5
          - value: 12
          - value: 750
          expectedReturn:
            distance: 13.0
            billableUnits: 13
            cost: 9750
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: 01_math-safe-log-retrieval
    mode: retrieval
    unseen: true
    sourceSectionIds:
    - 01_math-circle-summary-mastery
    title: 로그 입력 조건 다시 구성하기
    subtitle: 하루 뒤 기억에서 재구성
    goal: math.log의 입력 제약을 기억에서 복원하고 잘못된 값은 ValueError로 거부한다.
    why: 로그 함수는 정상 예시만 보면 위험한 입력 조건을 놓치기 쉽습니다. 시간이 지난 뒤에도 domain error를 스스로 막아야 실무 계산에 쓸 수 있습니다.
    explanation: 숙달 근거가 저장된 지 24시간이 지나면 자동으로 열립니다. 예시 없이 함수 계약부터 복원하세요.
    tips:
    - value와 base는 양수여야 하고 base는 1이면 안 됩니다.
    - 정상 결과는 소수점 넷째 자리까지 반올림하세요.
    exercise:
      prompt: safe_log_scale(value, base)가 유효한 로그값을 반환하고 잘못된 입력은 ValueError를 일으키도록 완성하세요.
      starterCode: |-
        import math

        def safe_log_scale(value, base):
            raise NotImplementedError
      solution: |-
        import math

        def safe_log_scale(value, base):
            if value <= 0 or base <= 0 or base == 1:
                raise ValueError("log input must be positive and base cannot be 1")
            return round(math.log(value, base), 4)
      hints:
      - math.log(value, base)는 밑을 지정할 수 있습니다.
      - 잘못된 입력을 조용히 0으로 바꾸면 검증이 통과하지 않습니다.
    check:
      id: python.builtins.math.safe-log.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.math.safe-log.retrieval.behavior.v1.fixture
      fixtureHash: sha256-EUE3dsIaRrkQcqkx52hMvHYX4XSUaDqh+aRH0f9shqI=
      fixture:
        directories: []
        env:
          LANG: C.UTF-8
          TZ: UTC
        files: []
        stdin: []
      packageAssets: []
      payload:
        entry: safe_log_scale
        cases:
        - id: powers-of-two
          arguments:
          - value: 8
          - value: 2
          expectedReturn: 3.0
        - id: powers-of-ten
          arguments:
          - value: 100
          - value: 10
          expectedReturn: 2.0
        - id: rejects-negative
          arguments:
          - value: -1
          - value: 10
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 24
`;export{e as default};