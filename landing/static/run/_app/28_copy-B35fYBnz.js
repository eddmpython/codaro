var e=`meta:\r
  id: 28_copy\r
  title: copy - 객체 복사\r
  category: builtins\r
  tags:\r
  - copy\r
  - 복사\r
  - deepcopy\r
  - shallow\r
  - clone\r
  description: 얕은 복사와 깊은 복사를 위한 copy 모듈\r
  keywords:\r
  - copy\r
  - 복사\r
  - deepcopy\r
  - shallow\r
  - clone\r
intro:\r
  emoji: 📋\r
  points:\r
  - 얕은 복사 vs 깊은 복사\r
  - 가변 객체 복제\r
  - 중첩 구조 처리\r
  - 참조 문제 해결\r
  direction: copy 객체 복사에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.\r
  benefits:\r
  - 작은 샘플 입력 확인 후 모듈 함수 호출에 맞는 코드 입력을 고릅니다.\r
  - copy 객체 복사 결과를 반환값, stdout, 객체 상태 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 표준 라이브러리 유틸리티에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 모듈 임포트 입력 확인\r
      detail: 입력 기준(작은 샘플 입력)과 필요한 조건을 먼저 고정합니다.\r
    - label: 얕은 복사 처리 실행\r
      detail: 모듈 함수 호출 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 깊은 복사 결과 검증\r
      detail: 반환값, stdout, 객체 상태 기준으로 실행 결과를 비교합니다.\r
    - label: copy 객체 복사 재사용\r
      detail: 완성 코드를 표준 라이브러리 유틸리티에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 표준 라이브러리 환경\r
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: copy 객체 복사 실행\r
      detail: 셀을 실행해 반환값, stdout, 객체 상태와 예외 상태를 확인합니다.\r
    - label: copy 객체 복사 완료\r
      detail: 검증된 코드를 표준 라이브러리 유틸리티로 남깁니다.\r
sections:\r
- id: module_import\r
  title: 모듈 임포트\r
  structuredPrimary: true\r
  subtitle: copy 시작하기\r
  goal: 모듈 임포트에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    copy는 파이썬 표준 라이브러리입니다. 객체의 얕은 복사와 깊은 복사를 제공합니다.\r
\r
    단순 할당(=)은 참조를 복사하고, copy()는 새 객체를 만들지만 내부 요소는 참조를 공유합니다. deepcopy()는 모든 것을 재귀적으로 복사합니다.\r
  snippet: |-\r
    import copy\r
\r
    original = [1, 2, 3]\r
    duplicated = copy.copy(original)\r
\r
    original, duplicated\r
  exercise:\r
    prompt: 모듈 임포트 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      import copy\r
\r
      original = [1, 2, 3]\r
      duplicated = copy.copy(original)\r
\r
      original, duplicated\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 모듈 임포트에서 \`original\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 모듈 임포트 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: shallow_copy\r
  title: 얕은 복사\r
  structuredPrimary: true\r
  subtitle: copy() 함수\r
  goal: 얕은 복사에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    얕은 복사는 객체의 최상위 레벨만 새로 생성하고, 내부 객체는 참조를 공유합니다.\r
\r
    얕은 복사는 중첩된 가변 객체(리스트 안의 리스트)에서 예상치 못한 동작을 일으킬 수 있습니다. 이런 경우 deepcopy()를 사용하세요.\r
  snippet: |-\r
    import copy\r
\r
    source = [1, 2, 3, 4, 5]\r
    cloned = copy.copy(source)\r
\r
    cloned.append(6)\r
\r
    source, cloned\r
  exercise:\r
    prompt: 얕은 복사 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      import copy\r
\r
      source = [1, 2, 3, 4, 5]\r
      cloned = copy.copy(source)\r
\r
      cloned.append(6)\r
\r
      source, cloned\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 얕은 복사에서 \`source\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 얕은 복사 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: deep_copy\r
  title: 깊은 복사\r
  structuredPrimary: true\r
  subtitle: deepcopy() 함수\r
  goal: 깊은 복사에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    깊은 복사는 객체와 그 안의 모든 객체를 재귀적으로 복사하여 완전히 독립적인 복제본을 만듭니다.\r
\r
    deepcopy()는 모든 레벨을 재귀적으로 복사하므로 메모리와 시간이 더 소요됩니다. 필요한 경우에만 사용하세요.\r
  snippet: |-\r
    import copy\r
\r
    original = [[1, 2], [3, 4]]\r
    deepClone = copy.deepcopy(original)\r
\r
    deepClone[0].append(999)\r
\r
    original, deepClone\r
  exercise:\r
    prompt: 깊은 복사 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      import copy\r
\r
      original = [[1, 2], [3, 4]]\r
      deepClone = copy.deepcopy(original)\r
\r
      deepClone[0].append(999)\r
\r
      original, deepClone\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 깊은 복사에서 \`original\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 깊은 복사 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: assignment_vs_copy\r
  title: 할당 vs 복사\r
  structuredPrimary: true\r
  subtitle: 참조와 복제의 차이\r
  goal: 할당 vs 복사에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    단순 할당(=)은 객체를 복사하지 않고 같은 객체를 가리키는 참조만 만듭니다.\r
\r
    가변 객체(리스트, 딕셔너리)를 함수 인자로 전달할 때 의도치 않은 수정을 방지하려면 복사본을 전달하세요.\r
  snippet: |-\r
    import copy\r
\r
    listA = [1, 2, 3]\r
    listB = listA\r
\r
    listB.append(4)\r
\r
    listA, listB\r
  exercise:\r
    prompt: 할당 vs 복사 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      import copy\r
\r
      listA = [1, 2, 3]\r
      listB = listA\r
\r
      listB.append(4)\r
\r
      listA, listB\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 할당 vs 복사에서 \`listA\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 할당 vs 복사 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: mutable_immutable\r
  title: 가변 vs 불변 객체\r
  structuredPrimary: true\r
  subtitle: 복사 동작의 차이\r
  goal: 가변 vs 불변 객체에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    불변 객체(int, str, tuple)는 복사가 필요 없지만, 가변 객체(list, dict, set)는 복사가 중요합니다.\r
\r
    튜플은 불변이지만 내부에 가변 객체를 포함할 수 있습니다. 이 경우 deepcopy()로 내부 가변 객체도 복사해야 합니다.\r
  snippet: |-\r
    import copy\r
\r
    immutableStr = "hello"\r
    copiedStr = copy.copy(immutableStr)\r
\r
    sameObject = id(immutableStr) == id(copiedStr)\r
    sameObject\r
  exercise:\r
    prompt: 가변 vs 불변 객체 예제에서 \`immutableStr\`, \`copiedStr\`, \`sameObject\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      import copy\r
\r
      immutableStr = "hello"\r
      copiedStr = copy.copy(immutableStr)\r
\r
      sameObject = id(immutableStr) == id(copiedStr)\r
      sameObject\r
    hints:\r
    - 바꿀 지점은 \`immutableStr = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`immutableStr\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 가변 vs 불변 객체에서 \`immutableStr\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 가변 vs 불변 객체 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: custom_objects\r
  title: 커스텀 객체 복사\r
  structuredPrimary: true\r
  subtitle: 클래스 인스턴스\r
  goal: 커스텀 객체 복사에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: |-\r
    사용자 정의 클래스의 인스턴스도 copy와 deepcopy로 복사할 수 있습니다.\r
\r
    클래스에 __copy__()와 __deepcopy__() 메서드를 정의하면 복사 동작을 커스터마이징할 수 있습니다.\r
  snippet: |-\r
    import copy\r
\r
    class Person:\r
        def __init__(self, name, age):\r
            self.name = name\r
            self.age = age\r
\r
    person1 = Person('Alice', 30)\r
    person2 = copy.copy(person1)\r
\r
    person2.age = 31\r
\r
    person1.age, person2.age\r
  exercise:\r
    prompt: 커스텀 객체 복사 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      import copy\r
\r
      class Person:\r
          def __init__(self, name, age):\r
              self.name = name\r
              self.age = age\r
\r
      person1 = Person('Alice', 30)\r
      person2 = copy.copy(person1)\r
\r
      person2.age = 31\r
\r
      person1.age, person2.age\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 커스텀 객체 복사의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 커스텀 객체 복사 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: practical\r
  title: 실전 활용\r
  structuredPrimary: true\r
  subtitle: 실무 복사 패턴\r
  goal: 설정 dict를 입력으로 받는 함수에서 copy.deepcopy로 원본을 보존하면서 변경된 새 dict를 돌려주는 안전 패턴을 만듭니다.\r
  why: 함수가 인자로 받은 dict/list를 직접 수정하면 호출자가 모르는 사이 원본이 바뀌어 추적 어려운 버그가 생깁니다. 입력은 read-only, 출력은 새 객체가 표준 룰입니다.\r
  explanation: |-\r
    실제 프로그래밍에서 자주 사용되는 복사 패턴들입니다.\r
\r
    원본 데이터를 보존해야 할 때는 항상 복사본을 만들어 작업하세요. 특히 설정, 상태, 데이터 변환에서 중요합니다.\r
  snippet: |-\r
    import copy\r
\r
    defaultConfig = {\r
        'host': 'localhost',\r
        'port': 8080,\r
        'features': ['auth', 'cache']\r
    }\r
\r
    customConfig = copy.deepcopy(defaultConfig)\r
    customConfig['port'] = 3000\r
    customConfig['features'].append('logging')\r
\r
    defaultConfig, customConfig\r
  exercise:\r
    prompt: 실전 활용 예제에서 기본 설정 dict나 중첩 리스트를 바꾸고 deepcopy가 원본을 보존하는지 확인하세요.\r
    starterCode: |-\r
      import copy\r
\r
      defaultConfig = {\r
          'host': 'localhost',\r
          'port': 8080,\r
          'features': ['auth', 'cache']\r
      }\r
\r
      customConfig = copy.deepcopy(defaultConfig)\r
      customConfig['port'] = 3000\r
      customConfig['features'].append('logging')\r
\r
      defaultConfig, customConfig\r
    hints:\r
    - 바꿀 지점은 \`defaultConfig\`의 키, \`customConfig\` 수정값, 중첩 \`features\` 리스트입니다.\r
    - 실행 뒤 \`defaultConfig\`와 \`customConfig\`가 서로 독립적으로 유지되는지 보세요.\r
  check:\r
    type: noError\r
    noError: 실전 활용의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 실전 활용의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: workflow_validation\r
  title: '검증 루프: 원본을 지키는 복사 전략'\r
  structuredPrimary: true\r
  subtitle: 예측 → 실행 → 오류 수정 → 검증\r
  goal: '검증 루프: 원본을 지키는 복사 전략에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.'\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: copy를 배울 때 핵심은 copy()와 deepcopy() 이름을 외우는 것이 아니라, 원본 데이터가 언제 오염되는지 먼저 예측하고 검증으로 막는 것입니다.\r
    설정, 작업 큐, 데이터 전처리처럼 원본 보존이 중요한 흐름에서는 독립성 검사가 함께 있어야 합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import copy\r
\r
    baseJob = {\r
        'name': 'daily-sales-report',\r
        'owner': 'analytics',\r
        'retry': {'max': 2, 'delaySeconds': 30},\r
        'steps': ['extract', 'validate', 'publish']\r
    }\r
\r
    shallowJob = copy.copy(baseJob)\r
    shallowJob['steps'].append('notify')\r
\r
    leakedToOriginal = 'notify' in baseJob['steps']\r
\r
    assert shallowJob is not baseJob\r
    assert shallowJob['steps'] is baseJob['steps']\r
    assert leakedToOriginal is True\r
    {'risk': 'nested list is shared', 'leakedToOriginal': leakedToOriginal}\r
  exercise:\r
    prompt: '검증 루프: 원본을 지키는 복사 전략 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.'\r
    starterCode: |-\r
      import copy\r
\r
      baseJob = {\r
          'name': 'daily-sales-report',\r
          'owner': 'analytics',\r
          'retry': {'max': 2, 'delaySeconds': 30},\r
          'steps': ['extract', 'validate', 'publish']\r
      }\r
\r
      shallowJob = copy.copy(baseJob)\r
      shallowJob['steps'].append('notify')\r
\r
      leakedToOriginal = 'notify' in baseJob['steps']\r
\r
      assert shallowJob is not baseJob\r
      assert shallowJob['steps'] is baseJob['steps']\r
      assert leakedToOriginal is True\r
      {'risk': 'nested list is shared', 'leakedToOriginal': leakedToOriginal}\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: '검증 루프: 원본을 지키는 복사 전략에서 \`baseJob\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.'\r
    resultCheck: '검증 루프: 원본을 지키는 복사 전략에서 기대값과 실제 결과가 같으면 검증이 통과하고, 다르면 실패해야 합니다.'\r
- id: practice\r
  title: 종합 복습\r
  structuredPrimary: true\r
  subtitle: 작게 실행하고 결과를 확인하는 단계\r
  goal: 종합 복습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 종합 복습의 핵심 흐름을 예제 코드로 확인하고, 같은 구조를 직접 실행해 결과를 검증한다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import copy\r
\r
    nums = [1, 2, 3]\r
    numsCopy = copy.copy(nums)\r
\r
    nums, numsCopy\r
  exercise:\r
    prompt: 종합 복습 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      import copy\r
\r
      nums = [1, 2, 3]\r
      numsCopy = copy.copy(nums)\r
\r
      nums, numsCopy\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:
    type: noError
    noError: 종합 복습에서 \`nums\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 종합 복습 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
assessment:
  masteryVariants:
  - id: 28_copy-boundary-audit-mastery
    mode: mastery
    unseen: false
    sourceSectionIds:
    - shallow_copy
    - deep_copy
    - workflow_validation
    title: 얕은 복사와 깊은 복사의 원본 오염 경계 증명하기
    subtitle: shared nested objects
    goal: 중첩 dict/list를 얕은 복사와 깊은 복사로 각각 수정한 뒤 원본이 어디서 바뀌는지 반환값으로 증명한다.
    why: copy 학습의 핵심은 함수 이름 암기가 아니라, 실제 데이터 구조에서 어떤 중첩 객체가 공유되는지 검증하는 습관입니다.
    explanation: audit_copy_boundaries(order)를 완성해 shallow copy는 중첩 items와 metadata를 공유하고, deepcopy는 중첩 구조를 독립 복제한다는 것을 결과 dict로 보여주세요.
    tips:
    - copy.copy 결과는 최상위 dict만 새 객체이고 내부 list/dict는 같은 객체입니다.
    - copy.deepcopy 결과를 수정해도 원본의 같은 위치 값은 바뀌지 않아야 합니다.
    exercise:
      prompt: audit_copy_boundaries(order)를 완성해 shallow와 deep copy의 공유 여부와 수정 결과를 반환하세요.
      starterCode: |-
        def audit_copy_boundaries(order):
            raise NotImplementedError
      solution: |-
        def audit_copy_boundaries(order):
            import copy

            if not order.get("items"):
                raise ValueError("items required")

            shallow = copy.copy(order)
            deep = copy.deepcopy(order)

            shallow["items"][0]["qty"] += 1
            shallow["metadata"]["rush"] = True
            deep["items"][1]["qty"] += 10

            return {
                "originalFirstQty": order["items"][0]["qty"],
                "originalSecondQty": order["items"][1]["qty"],
                "deepSecondQty": deep["items"][1]["qty"],
                "originalRush": order["metadata"]["rush"],
                "shallowSharesItems": shallow["items"] is order["items"],
                "deepSharesItems": deep["items"] is order["items"],
                "deepSharesMetadata": deep["metadata"] is order["metadata"],
            }
      hints:
      - 먼저 shallow를 수정해 원본이 함께 바뀌는 위치를 기록하세요.
      - deep을 수정한 뒤 원본의 같은 위치가 그대로인지 비교하세요.
    check:
      id: python.builtins.copy.boundary-audit.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.copy.empty.behavior.v1.fixture
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
        entry: audit_copy_boundaries
        cases:
        - id: reports-shallow-leak-and-deep-isolation
          arguments:
          - value:
              items:
              - sku: A-100
                qty: 2
              - sku: B-200
                qty: 1
              metadata:
                rush: false
              notes:
              - gift
          expectedReturn:
            originalFirstQty: 3
            originalSecondQty: 1
            deepSecondQty: 11
            originalRush: true
            shallowSharesItems: true
            deepSharesItems: false
            deepSharesMetadata: false
        - id: rejects-order-without-items
          arguments:
          - value:
              items: []
              metadata:
                rush: false
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: 28_copy-template-variant-transfer
    mode: transfer
    unseen: true
    sourceSectionIds:
    - practical
    - custom_objects
    - workflow_validation
    title: 교육 과정 템플릿을 deepcopy로 안전하게 파생하기
    subtitle: safe template variant
    goal: 기본 템플릿을 깊은 복사한 뒤 학습자 이름, 단계, rubric을 바꿔도 원본 템플릿이 보존되는지 반환한다.
    why: 실전에서는 기본 설정이나 커리큘럼 템플릿을 여러 변형으로 파생합니다. 여기서 원본을 오염시키면 이후 학습 흐름 전체가 틀어집니다.
    explanation: build_training_variant(template, learner_name, extra_step)를 완성해 deepcopy로 독립 변형을 만들고 원본과 변형의 steps/rubric 공유 여부를 함께 반환하세요.
    tips:
    - learner_name과 extra_step은 strip해서 저장하세요.
    - extra_step이 비어 있으면 의미 없는 변형이므로 ValueError로 막으세요.
    exercise:
      prompt: build_training_variant(template, learner_name, extra_step)를 완성해 원본 보존과 변형 결과를 반환하세요.
      starterCode: |-
        def build_training_variant(template, learner_name, extra_step):
            raise NotImplementedError
      solution: |-
        def build_training_variant(template, learner_name, extra_step):
            import copy

            step = extra_step.strip()
            if not step:
                raise ValueError("extra_step required")

            variant = copy.deepcopy(template)
            variant["learner"] = learner_name.strip()
            variant["steps"].append(step)
            variant["rubric"]["checks"].append("variant-smoke")

            return {
                "originalLearner": template["learner"],
                "variantLearner": variant["learner"],
                "originalSteps": template["steps"],
                "variantSteps": variant["steps"],
                "originalChecks": template["rubric"]["checks"],
                "variantChecks": variant["rubric"]["checks"],
                "sharesSteps": variant["steps"] is template["steps"],
                "sharesRubric": variant["rubric"] is template["rubric"],
            }
      hints:
      - 원본 template에는 append를 직접 호출하지 마세요.
      - 반환값에 원본과 변형을 모두 넣어 보존 여부가 드러나게 만드세요.
    check:
      id: python.builtins.copy.template-variant.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.copy.empty.behavior.v1.fixture
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
        entry: build_training_variant
        cases:
        - id: creates-independent-training-variant
          arguments:
          - value:
              learner: baseline
              steps:
              - read
              - edit
              - run
              rubric:
                checks:
                - no-error
          - value: " Hana "
          - value: " explain failure "
          expectedReturn:
            originalLearner: baseline
            variantLearner: Hana
            originalSteps:
            - read
            - edit
            - run
            variantSteps:
            - read
            - edit
            - run
            - explain failure
            originalChecks:
            - no-error
            variantChecks:
            - no-error
            - variant-smoke
            sharesSteps: false
            sharesRubric: false
        - id: rejects-empty-extra-step
          arguments:
          - value:
              learner: baseline
              steps:
              - read
              rubric:
                checks: []
          - value: Codaro
          - value: "   "
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: 28_copy-shallow-patch-retrieval
    mode: retrieval
    unseen: true
    sourceSectionIds:
    - module_import
    - assignment_vs_copy
    - shallow_copy
    title: 얕은 복사 설정 패치에서 중첩 aliasing 회상하기
    subtitle: top-level new, nested shared
    goal: copy.copy로 만든 설정 복사본의 최상위 값과 중첩 retry 값이 각각 어떻게 동작하는지 반환한다.
    why: 시간이 지나도 남아야 할 copy 감각은 얕은 복사가 최상위 객체만 새로 만들고 내부 가변 객체는 공유한다는 점입니다.
    explanation: simulate_shallow_patch(config, max_retries)를 완성해 최상위 enabled 변경은 원본에 새지 않지만, 중첩 retry 변경은 원본에 새는 것을 반환하세요.
    tips:
    - copy.copy(config)는 config 자체와 다른 객체입니다.
    - 하지만 config["retry"] 같은 중첩 dict는 같은 객체로 남습니다.
    exercise:
      prompt: simulate_shallow_patch(config, max_retries)를 완성해 얕은 복사의 최상위 변경과 중첩 변경 차이를 반환하세요.
      starterCode: |-
        def simulate_shallow_patch(config, max_retries):
            raise NotImplementedError
      solution: |-
        def simulate_shallow_patch(config, max_retries):
            import copy

            if max_retries < 1:
                raise ValueError("max_retries must be positive")

            cloned = copy.copy(config)
            cloned["enabled"] = False
            cloned["retry"]["max"] = max_retries

            return {
                "sameTopLevelObject": cloned is config,
                "sharesRetry": cloned["retry"] is config["retry"],
                "originalEnabled": config["enabled"],
                "clonedEnabled": cloned["enabled"],
                "originalRetryMax": config["retry"]["max"],
                "clonedRetryMax": cloned["retry"]["max"],
            }
      hints:
      - 최상위 enabled는 cloned에서만 바뀌어야 합니다.
      - retry max는 중첩 dict를 공유하므로 원본에서도 바뀝니다.
    check:
      id: python.builtins.copy.shallow-patch.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.copy.empty.behavior.v1.fixture
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
        entry: simulate_shallow_patch
        cases:
        - id: distinguishes-top-level-and-nested-mutation
          arguments:
          - value:
              enabled: true
              retry:
                max: 2
                delaySeconds: 30
          - value: 5
          expectedReturn:
            sameTopLevelObject: false
            sharesRetry: true
            originalEnabled: true
            clonedEnabled: false
            originalRetryMax: 5
            clonedRetryMax: 5
        - id: rejects-invalid-retry-count
          arguments:
          - value:
              enabled: true
              retry:
                max: 2
          - value: 0
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 24
`;export{e as default};