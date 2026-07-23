var e=`meta:\r
  id: 02_random\r
  title: random - 난수 생성\r
  category: builtins\r
  tags:\r
  - random\r
  - 난수\r
  - 무작위\r
  - 랜덤\r
  seo:\r
    title: 파이썬 random 모듈 완전 정복\r
    description: random 모듈로 난수 생성, 무작위 선택, 셔플 등 다양한 무작위 작업을 배웁니다.\r
    keywords:\r
    - random\r
    - 난수\r
    - randint\r
    - choice\r
    - shuffle\r
    - 파이썬랜덤\r
intro:\r
  emoji: 🎲\r
  points:\r
  - 정수/실수 난수 생성\r
  - 무작위 선택과 샘플링\r
  - 시퀀스 셔플\r
  - 게임과 시뮬레이션 활용\r
  direction: random 난수 생성에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.\r
  benefits:\r
  - 작은 샘플 입력 확인 후 모듈 함수 호출에 맞는 코드 입력을 고릅니다.\r
  - random 난수 생성 결과를 반환값, stdout, 객체 상태 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 표준 라이브러리 유틸리티에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: random 모듈 불러오기 입력 확인\r
      detail: 입력 기준(작은 샘플 입력)과 필요한 조건을 먼저 고정합니다.\r
    - label: 기본 난수 생성 처리 실행\r
      detail: 모듈 함수 호출 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 시퀀스 무작위 선택 결과 검증\r
      detail: 반환값, stdout, 객체 상태 기준으로 실행 결과를 비교합니다.\r
    - label: random 난수 생성 재사용\r
      detail: 완성 코드를 표준 라이브러리 유틸리티에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 표준 라이브러리 환경\r
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: random 난수 생성 실행\r
      detail: 셀을 실행해 반환값, stdout, 객체 상태와 예외 상태를 확인합니다.\r
    - label: random 난수 생성 완료\r
      detail: 검증된 코드를 표준 라이브러리 유틸리티로 남깁니다.\r
sections:\r
- id: module_import\r
  title: random 모듈 불러오기\r
  structuredPrimary: true\r
  subtitle: ⚠️ 가장 먼저 실행하세요\r
  goal: random 모듈 불러오기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표준 라이브러리는 외부 의존성 없이 파일, 시간, 문자열, 직렬화 같은 업무 코드를 구성하는 기반입니다.\r
  explanation: |-\r
    random은 파이썬 표준 라이브러리입니다. 난수를 생성하고 무작위 선택을 수행하는 모듈입니다. 별도 설치 없이 import만으로 사용할 수 있습니다.\r
\r
    이 섹션을 먼저 실행하면 아래 모든 예제에서 random 모듈을 사용할 수 있습니다.\r
  snippet: |-\r
    import random\r
\r
    # 모듈 로드 확인\r
    'random 모듈이 정상적으로 로드되었습니다'\r
  exercise:\r
    prompt: random 모듈 불러오기 예제에서 입력값을 바꾸고 마지막 확인 값이 달라지는지 확인하세요.\r
    starterCode: |-\r
      import random\r
\r
      # 모듈 로드 확인\r
      'random 모듈이 정상적으로 로드되었습니다'\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: random 모듈 불러오기의 수정 코드가 모듈 함수 호출 단계의 마지막 확인 값까지 도달해야 합니다.\r
    resultCheck: random 모듈 불러오기 실행 결과가 반환값, stdout, 객체 상태 기준으로 바꾼 입력값을 반영해야 합니다.\r
- id: basic_random\r
  title: 기본 난수 생성\r
  structuredPrimary: true\r
  subtitle: 실수와 정수 난수\r
  goal: 기본 난수 생성에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    random 모듈은 난수를 생성하는 파이썬 표준 라이브러리입니다. random()은 0.0 이상 1.0 미만의 실수를 반환하고, randint()는 지정 범위의 정수를 반환합니다. uniform()은 특정 범위의 실수를 생성합니다. 게임, 시뮬레이션, 테스트 데이터 생성에 필수적입니다.\r
\r
    randint(a, b)는 a와 b를 모두 포함하지만, randrange(a, b)는 b를 포함하지 않습니다.\r
  snippet: |-\r
    randomFloat = random.random()\r
    randomFloat\r
  exercise:\r
    prompt: 기본 난수 생성 예제에서 \`randomFloat\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      randomFloat = random.random()\r
      randomFloat\r
    hints:\r
    - 바꿀 지점은 \`randomFloat = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`randomFloat\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 기본 난수 생성에서 \`randomFloat\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 기본 난수 생성 실행 뒤 \`randomFloat\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: sequence_operations\r
  title: 시퀀스 무작위 선택\r
  structuredPrimary: true\r
  subtitle: 리스트에서 선택하기\r
  goal: 시퀀스 무작위 선택에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    시퀀스에서 무작위로 요소를 선택하는 함수들입니다. choice()는 하나를 선택하고, choices()는 여러 개를 중복 허용하여 선택합니다. sample()은 중복 없이 여러 개를 선택합니다. 이들은 추첨, 무작위 샘플링, 게임 구현에 유용합니다.\r
\r
    sample()의 k는 모집단 크기를 초과할 수 없지만, choices()는 가능합니다.\r
  snippet: |-\r
    fruits = ['apple', 'banana', 'cherry', 'date']\r
    chosen = random.choice(fruits)\r
    chosen\r
  exercise:\r
    prompt: 시퀀스 무작위 선택 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      fruits = ['apple', 'banana', 'cherry', 'date']\r
      chosen = random.choice(fruits)\r
      chosen\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 시퀀스 무작위 선택에서 \`fruits\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 시퀀스 무작위 선택 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: shuffling\r
  title: 셔플과 섞기\r
  structuredPrimary: true\r
  subtitle: 순서 무작위화\r
  goal: 셔플과 섞기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    shuffle()은 리스트를 제자리에서 무작위로 섞습니다. 카드 게임, 플레이리스트 섞기, 데이터 무작위화에 사용됩니다. 원본 리스트가 변경되므로 주의해야 하며, 복사본을 만들어 섞는 것이 안전합니다.\r
\r
    shuffle()은 반환값이 없습니다. shuffled = random.shuffle(list)는 None을 반환합니다.\r
  snippet: |-\r
    deck = [1, 2, 3, 4, 5]\r
    random.shuffle(deck)\r
    deck\r
  exercise:\r
    prompt: 셔플과 섞기 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      deck = [1, 2, 3, 4, 5]\r
      random.shuffle(deck)\r
      deck\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 셔플과 섞기에서 \`deck\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 셔플과 섞기 실행 뒤 \`deck\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.\r
- id: distributions\r
  title: 확률 분포\r
  structuredPrimary: true\r
  subtitle: 통계적 난수 생성\r
  goal: 확률 분포에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    random 모듈은 다양한 확률 분포를 지원합니다. 정규분포(gauss), 삼각분포(triangular), 베타분포(betavariate) 등 통계적 시뮬레이션과 과학 계산에 사용되는 분포들을 제공합니다. 실제 데이터를 모방하는 테스트 데이터를 생성할 때 유용합니다.\r
\r
    gauss()는 정규분포를, normalvariate()는 스레드 안전한 정규분포를 생성합니다.\r
  snippet: |-\r
    normalValue = random.gauss(100, 15)\r
    normalValue\r
  exercise:\r
    prompt: 확률 분포 예제에서 \`normalValue\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      normalValue = random.gauss(100, 15)\r
      normalValue\r
    hints:\r
    - 바꿀 지점은 \`normalValue = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`normalValue\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 확률 분포에서 \`normalValue\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 확률 분포 실행 뒤 \`normalValue\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: seed_control\r
  title: 시드와 재현성\r
  structuredPrimary: true\r
  subtitle: 난수 제어하기\r
  goal: 시드와 재현성에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    seed()는 난수 생성기의 시작점을 설정합니다. 같은 시드를 사용하면 항상 같은 난수 시퀀스가 생성되어 재현 가능한 결과를 얻을 수 있습니다. 디버깅, 테스트, 과학 실험에서 필수적입니다. getstate()와 setstate()로 난수 생성기 상태를 저장하고 복원할 수 있습니다.\r
\r
    시드를 설정하지 않으면 시스템 시간을 기반으로 난수가 생성됩니다.\r
  snippet: |-\r
    random.seed(42)\r
    firstValue = random.randint(1, 100)\r
    random.seed(42)\r
    secondValue = random.randint(1, 100)\r
    firstValue, secondValue\r
  exercise:\r
    prompt: 시드와 재현성 예제에서 \`firstValue\`, \`secondValue\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      random.seed(42)\r
      firstValue = random.randint(1, 100)\r
      random.seed(42)\r
      secondValue = random.randint(1, 100)\r
      firstValue, secondValue\r
    hints:\r
    - 바꿀 지점은 \`firstValue = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`firstValue\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 시드와 재현성에서 \`firstValue\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 시드와 재현성 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: practical_applications\r
  title: 실전 활용\r
  structuredPrimary: true\r
  subtitle: 게임과 시뮬레이션\r
  goal: 실전 활용에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    random 모듈의 실전 활용 예제를 살펴봅니다. 주사위 굴리기, 동전 던지기, 비밀번호 생성, 로또 번호 추첨 등 실생활 문제를 해결할 수 있습니다. 여러 함수를 조합하여 복잡한 무작위 작업을 구현합니다.\r
\r
    보안이 중요한 경우 secrets 모듈을 사용하세요. random은 암호학적으로 안전하지 않습니다.\r
  snippet: |-\r
    dice1 = random.randint(1, 6)\r
    dice2 = random.randint(1, 6)\r
    dice1, dice2, dice1 + dice2\r
  exercise:\r
    prompt: 실전 활용 예제에서 \`dice1\`, \`dice2\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      dice1 = random.randint(1, 6)\r
      dice2 = random.randint(1, 6)\r
      dice1, dice2, dice1 + dice2\r
    hints:\r
    - 바꿀 지점은 \`dice1 = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`dice1\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 실전 활용에서 \`dice1\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 실전 활용 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: workflow_validation\r
  title: '검증 루프: 재현 가능한 샘플링'\r
  structuredPrimary: true\r
  subtitle: seed, 원본 보호, 확률 분포 점검\r
  goal: '검증 루프: 재현 가능한 샘플링에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.'\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: 무작위 코드는 테스트하기 어렵기 때문에 seed와 전용 Random 객체로 재현성을 확보해야 합니다. 원본 데이터를 섞어버리지 않는지도 검증해야 실험군 배정,\r
    추첨, 테스트 데이터 생성에 안전하게 쓸 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    users = [f"user{i:02d}" for i in range(1, 13)]\r
\r
    def assignExperimentGroups(userIds, seed=20260524):\r
        rng = random.Random(seed)\r
        shuffledUsers = list(userIds)\r
        rng.shuffle(shuffledUsers)\r
        midpoint = len(shuffledUsers) // 2\r
        return {\r
            "control": sorted(shuffledUsers[:midpoint]),\r
            "variant": sorted(shuffledUsers[midpoint:]),\r
        }\r
\r
    firstAssignment = assignExperimentGroups(users)\r
    secondAssignment = assignExperimentGroups(users)\r
    assignedUsers = set(firstAssignment["control"]) | set(firstAssignment["variant"])\r
\r
    assert firstAssignment == secondAssignment\r
    assert assignedUsers == set(users)\r
    assert len(firstAssignment["control"]) == len(firstAssignment["variant"]) == 6\r
    assert users == [f"user{i:02d}" for i in range(1, 13)]\r
\r
    firstAssignment\r
  exercise:\r
    prompt: '검증 루프: 재현 가능한 샘플링 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.'\r
    starterCode: |-\r
      users = [f"user{i:02d}" for i in range(1, 13)]\r
\r
      def assignExperimentGroups(userIds, seed=20260524):\r
          rng = random.Random(seed)\r
          shuffledUsers = list(userIds)\r
          rng.shuffle(shuffledUsers)\r
          midpoint = len(shuffledUsers) // 2\r
          return {\r
              "control": sorted(shuffledUsers[:midpoint]),\r
              "variant": sorted(shuffledUsers[midpoint:]),\r
          }\r
\r
      firstAssignment = assignExperimentGroups(users)\r
      secondAssignment = assignExperimentGroups(users)\r
      assignedUsers = set(firstAssignment["control"]) | set(firstAssignment["variant"])\r
\r
      assert firstAssignment == secondAssignment\r
      assert assignedUsers == set(users)\r
      assert len(firstAssignment["control"]) == len(firstAssignment["variant"]) == 6\r
      assert users == [f"user{i:02d}" for i in range(1, 13)]\r
\r
      firstAssignment\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: '검증 루프: 재현 가능한 샘플링의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.'\r
    resultCheck: '검증 루프: 재현 가능한 샘플링 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.'\r
- id: practice\r
  title: random 모듈 종합 복습\r
  structuredPrimary: true\r
  subtitle: 난수 생성 마스터하기\r
  goal: random 모듈 종합 복습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: random 모듈의 다양한 함수를 활용하는 연습 문제입니다. 🟢 기본 미션부터 시작하여 🔴 심화 미션까지 도전해보세요.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    floatNum = random.random()\r
    floatNum\r
  exercise:\r
    prompt: random 모듈 종합 복습 예제에서 \`floatNum\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      floatNum = random.random()\r
      floatNum\r
    hints:\r
    - 바꿀 지점은 \`floatNum = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`floatNum\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:
    type: noError
    noError: random 모듈 종합 복습에서 \`floatNum\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: random 모듈 종합 복습 실행 뒤 \`floatNum\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.
assessment:
  masteryVariants:
  - id: 02_random-draw-ticket-mastery
    mode: mastery
    unseen: false
    sourceSectionIds:
    - basic_random
    - seed_control
    - practice
    title: 시드로 재현 가능한 번호 뽑기
    subtitle: 예시 없이 핵심 규칙 완성
    goal: random.Random(seed)를 사용해 범위 안 정수를 재현 가능하게 반환한다.
    why: 테스트 가능한 무작위 코드는 전역 random 상태가 아니라 전용 Random 객체와 seed를 함께 써야 합니다.
    explanation: 함수 본문을 완성하면 격리된 Python Worker가 보이지 않던 seed와 범위로 다시 호출합니다.
    tips:
    - random.seed 대신 random.Random(seed)로 함수 안 전용 생성기를 만드세요.
    - randint는 양 끝값을 모두 포함합니다.
    exercise:
      prompt: draw_ticket(seed, low, high)가 주어진 seed와 범위에서 재현 가능한 정수 하나를 반환하도록 완성하세요.
      starterCode: |-
        import random

        def draw_ticket(seed, low, high):
            raise NotImplementedError
      solution: |-
        import random

        def draw_ticket(seed, low, high):
            rng = random.Random(seed)
            return rng.randint(low, high)
      hints:
      - 함수 안에서 rng = random.Random(seed)를 먼저 만드세요.
      - low와 high를 하드코딩하면 다른 case에서 실패합니다.
    check:
      id: python.builtins.random.draw-ticket.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.random.draw-ticket.mastery.behavior.v1.fixture
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
        entry: draw_ticket
        cases:
        - id: small-range
          arguments:
          - value: 7
          - value: 1
          - value: 10
          expectedReturn: 6
        - id: large-range
          arguments:
          - value: 2026
          - value: 100
          - value: 999
          expectedReturn: 221
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: 02_random-split-groups-transfer
    mode: transfer
    unseen: true
    sourceSectionIds:
    - 02_random-draw-ticket-mastery
    title: 원본을 보존하며 실험군 나누기
    subtitle: 처음 보는 조건에 개념 적용
    goal: 전용 Random 객체와 shuffle을 조합해 재현 가능한 control, variant 그룹을 만든다.
    why: 샘플링 자동화는 결과 재현성과 원본 보존을 동시에 만족해야 신뢰할 수 있습니다.
    explanation: 숙달 검증이 저장된 뒤 자동으로 열리는 새 조건 과제입니다. 앞 예시가 아니라 입력과 반환 계약을 읽으세요.
    tips:
    - 입력 목록을 그대로 섞지 말고 복사본을 만든 뒤 shuffle 하세요.
    - 각 그룹은 비교하기 쉽도록 정렬해서 반환하세요.
    exercise:
      prompt: split_experiment_groups(user_ids, seed)가 control, variant, originalUnchanged를 담은 dict를 반환하도록 완성하세요.
      starterCode: |-
        import random

        def split_experiment_groups(user_ids, seed):
            raise NotImplementedError
      solution: |-
        import random

        def split_experiment_groups(user_ids, seed):
            rng = random.Random(seed)
            shuffled = list(user_ids)
            rng.shuffle(shuffled)
            midpoint = len(shuffled) // 2
            return {
                "control": sorted(shuffled[:midpoint]),
                "variant": sorted(shuffled[midpoint:]),
                "originalUnchanged": list(user_ids),
            }
      hints:
      - midpoint는 len(shuffled) // 2로 계산하세요.
      - originalUnchanged는 함수가 받은 순서를 그대로 보여주는 안전장치입니다.
    check:
      id: python.builtins.random.split-groups.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.random.split-groups.transfer.behavior.v1.fixture
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
        entry: split_experiment_groups
        cases:
        - id: four-users
          arguments:
          - value:
            - u1
            - u2
            - u3
            - u4
          - value: 11
          expectedReturn:
            control:
            - u1
            - u2
            variant:
            - u3
            - u4
            originalUnchanged:
            - u1
            - u2
            - u3
            - u4
        - id: six-users
          arguments:
          - value:
            - a
            - b
            - c
            - d
            - e
            - f
          - value: 5
          expectedReturn:
            control:
            - a
            - b
            - d
            variant:
            - c
            - e
            - f
            originalUnchanged:
            - a
            - b
            - c
            - d
            - e
            - f
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: 02_random-sample-retrieval
    mode: retrieval
    unseen: true
    sourceSectionIds:
    - 02_random-draw-ticket-mastery
    title: 중복 없는 샘플링 조건 다시 구성하기
    subtitle: 하루 뒤 기억에서 재구성
    goal: random.sample의 크기 제약을 기억에서 복원하고 불가능한 요청은 ValueError로 거부한다.
    why: 시간이 지난 뒤에도 표본 수와 모집단 크기 관계를 지켜야 무작위 추출 자동화가 조용히 틀어지지 않습니다.
    explanation: 숙달 근거가 저장된 지 24시간이 지나면 자동으로 열립니다. 예시 없이 함수 계약부터 복원하세요.
    tips:
    - sample은 중복 없이 뽑으므로 count가 전체 개수보다 크면 실패해야 합니다.
    - 검사 결과를 안정적으로 비교하려면 뽑은 뒤 정렬하세요.
    exercise:
      prompt: pick_without_replacement(items, count, seed)가 중복 없는 정렬 샘플을 반환하고 count가 너무 크면 ValueError를 일으키도록 완성하세요.
      starterCode: |-
        import random

        def pick_without_replacement(items, count, seed):
            raise NotImplementedError
      solution: |-
        import random

        def pick_without_replacement(items, count, seed):
            if count > len(items):
                raise ValueError("count cannot exceed item count")
            rng = random.Random(seed)
            return sorted(rng.sample(list(items), count))
      hints:
      - random.sample(list(items), count)를 사용하세요.
      - count 오류를 무시하고 가능한 만큼만 반환하면 검증이 통과하지 않습니다.
    check:
      id: python.builtins.random.sample.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.random.sample.retrieval.behavior.v1.fixture
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
        entry: pick_without_replacement
        cases:
        - id: colors
          arguments:
          - value:
            - red
            - blue
            - green
            - yellow
          - value: 2
          - value: 3
          expectedReturn:
          - blue
          - green
        - id: numbers
          arguments:
          - value:
            - 1
            - 2
            - 3
            - 4
            - 5
          - value: 3
          - value: 9
          expectedReturn:
          - 2
          - 3
          - 4
        - id: rejects-oversize
          arguments:
          - value:
            - only
          - value: 2
          - value: 1
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 24
`;export{e as default};