var e=`meta:
  id: regex_02
  title: 전화번호형식통일
  order: 2
  category: regex
  difficulty: ⭐
  badge: 입문
  tags:
  - 전화번호
  - 그룹
  - sub
  - 치환
  - 형식 변환
  - 로컬 샘플
  seo:
    title: 정규표현식 입문 - 전화번호 형식 통일
    description: 정규표현식으로 다양한 전화번호 형식을 통일합니다. 그룹 캡처, re.sub, 형식 변환을 배웁니다.
    keywords:
    - 정규표현식
    - regex
    - 전화번호
    - re.sub
    - 그룹 캡처
    - 형식 변환
intro:
  emoji: 📱
  goal: 다양한 형식의 전화번호를 010-XXXX-XXXX 형태로 통일합니다.
  description: 이전 프로젝트에서 배운 패턴 매칭에 이어, 이번엔 텍스트 치환을 배웁니다. 그룹 캡처로 원하는 부분만 추출하고, re.sub로 형식을 변환합니다.
  direction: 전화번호형식통일에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.
  benefits:
  - 샘플 문자열 확인 후 패턴 매칭과 치환에 맞는 코드 입력을 고릅니다.
  - 전화번호형식통일 결과를 매치 그룹, 추출 목록, 치환 결과 기준으로 즉시 점검합니다.
  - 완료한 코드를 로그/문서 정제 자동화에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: 1단계. 라이브러리 불러오기 입력 확인
      detail: 입력 기준(샘플 문자열)과 필요한 조건을 먼저 고정합니다.
    - label: 2단계. 데이터 불러오기 처리 실행
      detail: 패턴 매칭과 치환 코드를 실행해 중간 결과를 확인합니다.
    - label: 3단계. 전화번호 형식 탐색 결과 검증
      detail: 매치 그룹, 추출 목록, 치환 결과 기준으로 실행 결과를 비교합니다.
    - label: 전화번호형식통일 재사용
      detail: 완성 코드를 로그/문서 정제 자동화에 붙일 수 있게 정리합니다.
    runtime:
    - label: 텍스트 정제 환경
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.
    - label: 전화번호형식통일 실행
      detail: 셀을 실행해 매치 그룹, 추출 목록, 치환 결과와 예외 상태를 확인합니다.
    - label: 전화번호형식통일 완료
      detail: 검증된 코드를 로그/문서 정제 자동화로 남깁니다.
sections:
- id: step1_import
  title: 1단계. 라이브러리 불러오기
  structuredPrimary: true
  subtitle: import
  goal: 1단계. 라이브러리 불러오기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: import 준비가 정확해야 다음 셀과 자동화 코드에서 같은 이름을 안정적으로 재사용할 수 있습니다.
  explanation: 이전 프로젝트와 동일하게 re 모듈을 불러옵니다. 이번 프로젝트에서는 단순 추출이 아닌 텍스트 치환을 배우게 됩니다. re.sub() 함수를 사용하면 패턴과
    일치하는 부분을 원하는 형식으로 변환할 수 있어, 데이터 정제 작업에 핵심적으로 사용됩니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: import re
  exercise:
    prompt: 1단계. 라이브러리 불러오기 예제에서 import한 모듈의 별칭이나 바로 이어지는 확인 호출을 바꿔 준비 상태를 확인하세요.
    starterCode: import re
    hints:
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    type: noError
    noError: 1단계. 라이브러리 불러오기의 import 대상 모듈과 별칭이 현재 로컬 환경에서 준비되어야 합니다.
    resultCheck: 1단계. 라이브러리 불러오기 다음 셀에서 import한 이름을 사용할 수 있어야 합니다.
- id: step2_load
  title: 2단계. 데이터 불러오기
  structuredPrimary: true
  subtitle: 로컬 전화번호 샘플
  goal: 2단계. 데이터 불러오기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.
  explanation: 전화번호 형식이 서로 다른 사용자 샘플을 로컬 데이터로 준비합니다. 실무에서도 고객 데이터, 영업 리드, 상담 기록에서 하이픈, 마침표, 괄호, 공백, 확장번호가
    섞인 값을 자주 만나므로 먼저 같은 문제를 작은 데이터로 재현합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    usersData = [
        {"name": "Hana Kim", "phone": "010-1234-5678"},
        {"name": "Min Park", "phone": "010.9876.5432 x102"},
        {"name": "Jae Lee", "phone": "(010)5555-1122"},
        {"name": "Soo Choi", "phone": "010 3333 4444"},
        {"name": "Yuna Jung", "phone": "010-777-8888 x45"},
        {"name": "Alex Morgan", "phone": "010.2468.1357"},
        {"name": "Rina Han", "phone": "(010)8642-9753 x9"},
        {"name": "Noah Shin", "phone": "010 1111 2222"},
        {"name": "Mina Kwon", "phone": "010-9090-8080"},
        {"name": "Leo Yu", "phone": "010.1212.3434 x777"},
    ]

    usersData[:2]
  exercise:
    prompt: 2단계. 데이터 불러오기 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      usersData = [
          {"name": "Hana Kim", "phone": "010-1234-5678"},
          {"name": "Min Park", "phone": "010.9876.5432 x102"},
          {"name": "Jae Lee", "phone": "(010)5555-1122"},
          {"name": "Soo Choi", "phone": "010 3333 4444"},
          {"name": "Yuna Jung", "phone": "010-777-8888 x45"},
          {"name": "Alex Morgan", "phone": "010.2468.1357"},
          {"name": "Rina Han", "phone": "(010)8642-9753 x9"},
          {"name": "Noah Shin", "phone": "010 1111 2222"},
          {"name": "Mina Kwon", "phone": "010-9090-8080"},
          {"name": "Leo Yu", "phone": "010.1212.3434 x777"},
      ]

      usersData[:2]
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    type: noError
    noError: 2단계. 데이터 불러오기의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.
    resultCheck: 2단계. 데이터 불러오기의 실행 결과가 본문 기대값과 일치해야 합니다.
- id: step3_explore
  title: 3단계. 전화번호 형식 탐색
  structuredPrimary: true
  subtitle: 다양한 형식 확인
  goal: 3단계. 전화번호 형식 탐색에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.
  explanation: |-
    실제 데이터에는 전화번호가 여러 형식으로 저장되어 있습니다. 하이픈으로 구분된 형식, 마침표로 구분된 형식, 괄호가 포함된 형식, 확장번호가 붙은 형식 등 다양합니다. 정규표현식으로 이런 모든 형식을 하나로 통일하려면 먼저 어떤 패턴들이 있는지 파악해야 합니다.

    확인된 형식들: - \`010-1234-5678\` (하이픈 구분) - \`010.9876.5432 x102\` (마침표 + 확장번호) - \`(010)5555-1122\` (괄호 + 하이픈) - \`010 3333 4444\` (공백 구분) 우리의 목표: 모두 \`010-XXXX-XXXX\` 형식으로 통일
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    phones = [user['phone'] for user in usersData[:5]]
    phones
  exercise:
    prompt: 3단계. 전화번호 형식 탐색 예제에서 패턴이나 샘플 문자열을 바꾸고 추출/치환 결과가 달라지는지 확인하세요.
    starterCode: |-
      phones = [user['phone'] for user in usersData[:5]]
      phones
    hints:
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 3단계. 전화번호 형식 탐색의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.
    resultCheck: 3단계. 전화번호 형식 탐색 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.
- id: step4_pattern_with_groups
  title: 4단계. 그룹으로 패턴 만들기
  structuredPrimary: true
  subtitle: ( ) 로 부분 캡처
  goal: 4단계. 그룹으로 패턴 만들기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.
  explanation: 4단계. 그룹으로 패턴 만들기의 핵심 흐름을 예제 코드로 확인하고, 같은 구조를 직접 실행해 결과를 검증한다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    testText = """
    010-1234-5678
    010.9876.5432 x102
    (010)5555-1122
    010 3333 4444
    010-777-8888 x45
    """
  exercise:
    prompt: 4단계. 그룹으로 패턴 만들기 예제에서 패턴이나 샘플 문자열을 바꾸고 추출/치환 결과가 달라지는지 확인하세요.
    starterCode: |-
      testText = """
      010-1234-5678
      010.9876.5432 x102
      (010)5555-1122
      010 3333 4444
      010-777-8888 x45
      """
    hints:
    - 바꿀 지점은 정규식 패턴, 그룹, re.search/findall/sub의 입력 문자열입니다.
    - 실행 뒤 매치 그룹, 추출 목록, 치환 문자열이 바꾼 패턴과 맞는지 보세요.
  check:
    type: noError
    noError: 4단계. 그룹으로 패턴 만들기의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.
    resultCheck: 4단계. 그룹으로 패턴 만들기의 실행 결과가 본문 기대값과 일치해야 합니다.
- id: step5_format_conversion
  title: 5단계. re.sub로 형식 변환
  structuredPrimary: true
  subtitle: 치환과 그룹 참조
  goal: 5단계. re.sub로 형식 변환에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.
  explanation: |-
    re.sub는 패턴과 일치하는 부분을 다른 텍스트로 치환합니다. 치환 문자열에서 그룹을 참조할 때는 \\\\1, \\\\2, \\\\3을 사용합니다. 이 기능을 활용하면 원본 텍스트의 일부를 유지하면서 형식만 변경할 수 있어, 데이터 정규화 작업에 매우 유용합니다.

    re.sub(패턴, 치환문자열, 텍스트)
    - 패턴과 일치하는 모든 부분을 치환문자열로 교체합니다 - \`\\1\`, \`\\2\`, \`\\3\` : 각각 그룹 1, 2, 3을 참조 - \`r"\\1-\\2-\\3"\` → 첫번째그룹-두번째그룹-세번째그룹
  tips:
  - 're.sub(패턴, 치환문자열, 텍스트) - 패턴과 일치하는 모든 부분을 치환문자열로 교체합니다 - \`\\1\`, \`\\2\`, \`\\3\` : 각각 그룹 1, 2, 3을 참조 - \`r"\\1-\\2-\\3"\`
    → 첫번째그룹-두번째그룹-세번째그룹'
  snippet: |-
    pattern = r"[\\(]?(\\d{3})[\\)\\-\\.]?\\s?(\\d{3,4})[\\s\\-\\.](\\d{4})"
    replacement = r"\\1-\\2-\\3"

    cleanedText = re.sub(pattern, replacement, testText)
    cleanedText
  exercise:
    prompt: 5단계. re.sub로 형식 변환 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      pattern = r"[\\(]?(\\d{3})[\\)\\-\\.]?\\s?(\\d{3,4})[\\s\\-\\.](\\d{4})"
      replacement = r"\\1-\\2-\\3"

      cleanedText = re.sub(pattern, replacement, testText)
      cleanedText
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    type: noError
    noError: 5단계. re.sub로 형식 변환의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.
    resultCheck: 5단계. re.sub로 형식 변환의 실행 결과가 본문 기대값과 일치해야 합니다.
- id: step6_clean_extension
  title: 6단계. 확장번호 제거
  structuredPrimary: true
  subtitle: 추가 정제
  goal: 6단계. 확장번호 제거에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.
  explanation: |-
    확장번호(x102 같은 부분)도 함께 제거하면 더 깔끔합니다. 공백 + x + 숫자 패턴을 찾아서 빈 문자열로 치환하면 됩니다. re.sub의 치환 문자열을 빈 문자열("")로 지정하면 매칭된 부분이 삭제되는 효과를 얻을 수 있습니다.

    여러 단계 치환
    복잡한 텍스트 정제는 여러 단계로 나누는 것이 좋습니다. 한 번에 하나의 작업만 수행하면 디버깅이 쉽습니다.
  tips:
  - 여러 단계 치환 복잡한 텍스트 정제는 여러 단계로 나누는 것이 좋습니다. 한 번에 하나의 작업만 수행하면 디버깅이 쉽습니다.
  snippet: |-
    extPattern = r"\\s+x\\d+"

    finalText = re.sub(extPattern, "", cleanedText)
    finalText
  exercise:
    prompt: 6단계. 확장번호 제거 예제에서 패턴이나 샘플 문자열을 바꾸고 추출/치환 결과가 달라지는지 확인하세요.
    starterCode: |-
      extPattern = r"\\s+x\\d+"

      finalText = re.sub(extPattern, "", cleanedText)
      finalText
    hints:
    - 바꿀 지점은 정규식 패턴, 그룹, re.search/findall/sub의 입력 문자열입니다.
    - 실행 뒤 매치 그룹, 추출 목록, 치환 문자열이 바꾼 패턴과 맞는지 보세요.
  check:
    type: noError
    noError: 6단계. 확장번호 제거의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.
    resultCheck: 6단계. 확장번호 제거의 실행 결과가 본문 기대값과 일치해야 합니다.
- id: step7_apply_to_data
  title: 7단계. 실제 데이터에 적용
  structuredPrimary: true
  subtitle: 모든 사용자 전화번호 정제
  goal: 7단계. 실제 데이터에 적용에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.
  explanation: |-
    배운 패턴을 실제 사용자 데이터에 적용하여 모든 전화번호를 통일된 형식으로 변환합니다. 반복 사용할 코드는 함수로 만들어두면 재사용하기 편리합니다. 함수화하면 여러 단계의 정제 과정을 하나로 묶어서 관리할 수 있고, 다른 데이터셋에도 쉽게 적용할 수 있습니다.

    완벽하게 통일된 형식으로 변환되었습니다. 10명 모두의 전화번호가 일관된 010-XXXX-XXXX 형식으로 정리되었습니다. 이런 데이터 정규화는 데이터베이스 저장, 검색, 분석의 기초가 됩니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    def cleanPhone(phone):
        pattern = r"[\\(]?(\\d{3})[\\)\\-\\.]?\\s?(\\d{3,4})[\\s\\-\\.](\\d{4})"
        cleaned = re.sub(pattern, r"\\1-\\2-\\3", phone)
        cleaned = re.sub(r"\\s+x\\d+", "", cleaned)
        return cleaned
  exercise:
    prompt: 7단계. 실제 데이터에 적용 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      def cleanPhone(phone):
          pattern = r"[\\(]?(\\d{3})[\\)\\-\\.]?\\s?(\\d{3,4})[\\s\\-\\.](\\d{4})"
          cleaned = re.sub(pattern, r"\\1-\\2-\\3", phone)
          cleaned = re.sub(r"\\s+x\\d+", "", cleaned)
          return cleaned
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 7단계. 실제 데이터에 적용의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.
    resultCheck: 7단계. 실제 데이터에 적용 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: step8_result
  title: 8단계. 결과 확인
  structuredPrimary: true
  subtitle: 변환 전후 비교
  goal: 8단계. 결과 확인에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.
  explanation: |-
    원본과 변환된 전화번호를 나란히 비교해봅시다. 변환 전후를 비교하면 정규표현식이 얼마나 다양한 형식을 처리했는지 한눈에 확인할 수 있습니다. 이런 비교 출력은 데이터 정제 작업의 검증에도 유용합니다.

    **배운 핵심 개념:** - \`\\d{n}\` : 숫자 정확히 n개 - \`\\d{n,m}\` : 숫자 n~m개 - \`( )\` : 그룹으로 캡처 - \`\\1, \\2, \\3\` : 그룹 참조 - \`re.sub()\` : 패턴 치환
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    comparison = [
        {"원본": user['phone'], "변환": cleanPhone(user['phone'])}
        for user in usersData[:5]
    ]
    comparison
  exercise:
    prompt: 8단계. 결과 확인 예제에서 패턴이나 샘플 문자열을 바꾸고 추출/치환 결과가 달라지는지 확인하세요.
    starterCode: |-
      comparison = [
          {"원본": user['phone'], "변환": cleanPhone(user['phone'])}
          for user in usersData[:5]
      ]
      comparison
    hints:
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 8단계. 결과 확인의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.
    resultCheck: 8단계. 결과 확인 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.
- id: step9_workflow
  title: 9단계. 실무 전화번호 정제 검증
  structuredPrimary: true
  subtitle: 예측 → 오류 확인 → 검증 → 기준 실험
  goal: 단순 치환이 잘못된 자리수의 전화번호를 통과시키는 문제를 먼저 보여 주고, 자릿수까지 검증하는 strict normalizer로 정상/검토 그룹을 분리합니다.
  why: 운영의 전화번호 데이터는 자릿수가 어긋난 입력이 섞여 들어옵니다. 단순 정규식 치환은 결과가 보기 좋아도 검토 대상을 놓치기 쉬워 검증 단계가 반드시 필요합니다.
  explanation: 전화번호 정제는 치환 결과가 보기 좋아도 끝이 아닙니다. 목표 형식이 \`010-XXXX-XXXX\`라면 중간 번호가 3자리인 값은 자동 통과시키지 말고 검토
    대상으로 분리해야 합니다. 이번 단계에서는 기존 단순 치환이 놓치는 문제를 먼저 확인합니다. 그다음 엄격한 정규화 함수를 만들어 정상 번호와 검토 번호를 나누고, 운영 기준을
    완화했을 때 결과가 어떻게 달라지는지 실험합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    targetPhonePattern = re.compile(r"^010-\\d{4}-\\d{4}$")
    rawPhones = [user["phone"] for user in usersData]

    expectedReviewCount = 1
    print("예상: 중간 번호 3자리 값은 검토 대상으로 분리합니다.")
    rawPhones
  exercise:
    prompt: 9단계. 실무 전화번호 정제 검증 예제에서 이미지 크기, 색상, 임계값, 필터 설정 중 하나를 바꾸고 결과 배열을 확인하세요.
    starterCode: |-
      targetPhonePattern = re.compile(r"^010-\\d{4}-\\d{4}$")
      rawPhones = [user["phone"] for user in usersData]

      expectedReviewCount = 1
      print("예상: 중간 번호 3자리 값은 검토 대상으로 분리합니다.")
      rawPhones
    hints:
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 9단계. 실무 전화번호 정제 검증의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.
    resultCheck: 9단계. 실무 전화번호 정제 검증 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.
- id: practice
  title: 실습
  structuredPrimary: true
  subtitle: 전화번호 정제 프로젝트
  goal: 실습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.
  explanation: |-
    데이터 정제 담당자가 되어 다양한 형식의 데이터를 통일합니다. 미션1에서는 날짜 형식을 변환하고, 미션2에서는 로컬 사용자 샘플의 전화번호를 정제합니다. 그룹 캡처와 re.sub를 활용해 형식 변환을 연습합니다. 각 미션은 import문부터 시작하여 독립적으로 실행할 수 있습니다.

    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.
  snippet: |-
    import re

    text = """
    생년월일: 1990/12/25
    입사일: 2020/03/15
    계약일: 2023/07/01
    """

    pattern = r"(\\d{4})/(\\d{2})/(\\d{2})"
    result = re.sub(pattern, r"\\1-\\2-\\3", text)
    result
  exercise:
    prompt: 실습 예제에서 패턴이나 샘플 문자열을 바꾸고 추출/치환 결과가 달라지는지 확인하세요.
    starterCode: |-
      import re

      text = """
      생년월일: 1990/12/25
      입사일: 2020/03/15
      계약일: 2023/07/01
      """

      pattern = r"(\\d{4})/(\\d{2})/(\\d{2})"
      result = re.sub(pattern, r"\\1-\\2-\\3", text)
      result
    hints:
    - 바꿀 지점은 정규식 패턴, 그룹, re.search/findall/sub의 입력 문자열입니다.
    - 실행 뒤 매치 그룹, 추출 목록, 치환 문자열이 바꾼 패턴과 맞는지 보세요.
  check:
    type: noError
    noError: 실습의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.
    resultCheck: 실습의 실행 결과가 본문 기대값과 일치해야 합니다.
- id: summary
  title: 정리
  subtitle: 두 번째 프로젝트 완료!
  blocks:
  - type: text
    content: 이번 프로젝트에서는 그룹 캡처와 re.sub()를 배웠습니다. 패턴의 일부를 소괄호로 캡처하고, 치환 문자열에서 \\\\1, \\\\2 등으로 재사용할 수 있습니다.
      이 기법은 전화번호, 날짜, 주민번호, 계좌번호 등 형식이 있는 모든 데이터의 정규화에 활용됩니다.
  - type: list
    items:
    - \\d{n} - 숫자 정확히 n개
    - \\d{n,m} - 숫자 n~m개
    - ( ) - 그룹으로 캡처
    - \\1, \\2, \\3 - 그룹 참조
    - re.sub() - 패턴 치환
  - type: text
    content: 다음 프로젝트에서는 URL을 프로토콜, 도메인, 경로로 분해하는 방법을 배웁니다!
  goal: 정리에서 패턴과 입력 문자열이 추출/치환 결과로 이어지는 흐름을 확인한다.
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.
- id: workflow_validation
  title: '현업 흐름 검증: 연락처 텍스트 정제 파이프라인'
  structuredPrimary: true
  subtitle: 예측 → 패턴 실행 → 오류 수정 → 검증 → 실무 변주
  goal: '현업 흐름 검증: 연락처 텍스트 정제 파이프라인에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.'
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.
  explanation: 정규표현식은 한 번 매칭되면 끝나는 문법이 아니라, 입력 텍스트를 정제하고 실패 패턴을 확인한 뒤 결과를 검증하는 반복 작업입니다. 여기서는 이메일과 전화번호를
    추출하고, 잘못된 패턴과 빈 입력을 안전하게 처리합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    import re

    contactText = '''
    김개발 <kim@example.com> 010-1234-5678
    lee@company.co.kr / 02-987-6543
    잘못된 주소: hello@ / 번호: 12345
    '''

    emailPattern = re.compile(r'[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}')
    phonePattern = re.compile(r'(?:010-\\d{4}-\\d{4}|02-\\d{3}-\\d{4})')

    emails = emailPattern.findall(contactText)
    phones = phonePattern.findall(contactText)

    assert emails == ['kim@example.com', 'lee@company.co.kr']
    assert phones == ['010-1234-5678', '02-987-6543']
    emails, phones
  exercise:
    prompt: '현업 흐름 검증: 연락처 텍스트 정제 파이프라인 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.'
    starterCode: |-
      import re

      contactText = '''
      김개발 <kim@example.com> 010-1234-5678
      lee@company.co.kr / 02-987-6543
      잘못된 주소: hello@ / 번호: 12345
      '''

      emailPattern = re.compile(r'[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}')
      phonePattern = re.compile(r'(?:010-\\d{4}-\\d{4}|02-\\d{3}-\\d{4})')

      emails = emailPattern.findall(contactText)
      phones = phonePattern.findall(contactText)

      assert emails == ['kim@example.com', 'lee@company.co.kr']
      assert phones == ['010-1234-5678', '02-987-6543']
      emails, phones
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    type: noError
    noError: '현업 흐름 검증: 연락처 텍스트 정제 파이프라인의 정규식 패턴이 컴파일되고 입력 텍스트가 매치 단계까지 도달해야 합니다.'
    resultCheck: '현업 흐름 검증: 연락처 텍스트 정제 파이프라인 결과의 추출 개수와 매치 문자열이 본문 기대값과 같아야 합니다.'
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
  - id: regex_02-phone-number-normalization-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - step1_import
    - workflow_validation
    title: 한국 전화번호를 E.164 identity로 정규화하기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: 구분자와 국내 prefix를 처리하고 모호한 길이는 거부한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 숫자만 남기는 것으로 끝내지 말고 국가 코드와 종류를 명시하세요.
    - 길이가 모호한 번호를 추측해 채우지 마세요.
    exercise:
      prompt: normalize_korean_phone(value)를 완성하세요.
      starterCode: |-
        def normalize_korean_phone(value):
            raise NotImplementedError
      solution: |
        def normalize_korean_phone(value):
            digits = "".join(character for character in value if character.isdigit())
            if digits.startswith("82"):
                national = "0" + digits[2:]
            else:
                national = digits
            if national.startswith("010") and len(national) == 11:
                return {"e164": "+82" + national[1:], "kind": "mobile"}
            if national.startswith("02") and len(national) in {9, 10}:
                return {"e164": "+82" + national[1:], "kind": "seoul-landline"}
            raise ValueError("unsupported Korean phone number")
      hints: *id001
    check:
      id: python.regex.regex_02.phone-number-normalization.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.regex.regex_02.phone-number-normalization.mastery.behavior.v1.fixture
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
        entry: normalize_korean_phone
        cases:
        - id: normalizes-mobile
          arguments:
          - value: 010-1234-5678
          expectedReturn:
            e164: '+821012345678'
            kind: mobile
        - id: normalizes-country-code
          arguments:
          - value: +82 10 9876 5432
          expectedReturn:
            e164: '+821098765432'
            kind: mobile
        - id: normalizes-seoul-landline
          arguments:
          - value: 02-123-4567
          expectedReturn:
            e164: '+8221234567'
            kind: seoul-landline
        - id: rejects-short-number
          arguments:
          - value: 010-123
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: regex_02-phone-batch-reconciliation-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - regex_02-phone-number-normalization-mastery
    title: 새 연락처 batch에 중복·동의 상태 감사 전이하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: 정규화된 전화 identity별로 중복과 연락 동의 누락을 보고한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - 표시 형식이 다른 번호는 E.164로 정규화한 뒤 중복을 찾으세요.
    - 번호 형식 통일이 연락 동의를 의미하지 않습니다.
    exercise:
      prompt: audit_phone_batch(records)를 완성하세요.
      starterCode: |-
        def audit_phone_batch(records):
            raise NotImplementedError
      solution: |
        def audit_phone_batch(records):
            by_phone = {}
            for record in records:
                by_phone.setdefault(record["phone"], []).append(record)
            duplicates = sorted(phone for phone, items in by_phone.items() if len(items) > 1)
            no_consent = sorted(record["id"] for record in records if not record.get("contactConsent", False))
            conflicts = []
            for phone, items in sorted(by_phone.items()):
                owners = sorted({item["id"] for item in items})
                if len(owners) > 1:
                    conflicts.append({"phone": phone, "owners": owners})
            return {"ready": not duplicates and not no_consent, "duplicates": duplicates, "noConsent": no_consent, "conflicts": conflicts}
      hints: *id002
    check:
      id: python.regex.regex_02.phone-batch-reconciliation.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.regex.regex_02.phone-batch-reconciliation.transfer.behavior.v1.fixture
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
        entry: audit_phone_batch
        cases:
        - id: accepts-unique-consented-records
          arguments:
          - value:
            - id: a
              phone: '+821011112222'
              contactConsent: true
          expectedReturn:
            ready: true
            duplicates: []
            noConsent: []
            conflicts: []
        - id: reports-duplicate-owners
          arguments:
          - value:
            - id: a
              phone: '+821011112222'
              contactConsent: true
            - id: b
              phone: '+821011112222'
              contactConsent: true
          expectedReturn:
            ready: false
            duplicates:
            - '+821011112222'
            noConsent: []
            conflicts:
            - phone: '+821011112222'
              owners:
              - a
              - b
        - id: reports-no-consent
          arguments:
          - value:
            - id: a
              phone: '+821011112222'
              contactConsent: false
          expectedReturn:
            ready: false
            duplicates: []
            noConsent:
            - a
            conflicts: []
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: regex_02-phone-normalization-recall-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - regex_02-phone-batch-reconciliation-transfer
    title: 전화번호 정규화 경계 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: 형식·identity·연락 권한을 구분한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - match 수만 보지 말고 정규화 뒤 보존된 의미와 거부된 입력을 함께 확인하세요.
    - regex가 아닌 전용 parser가 필요한 구조에서는 경계를 명시하세요.
    exercise:
      prompt: choose_phone_evidence(situation)를 완성해 action, evidence, risk를 반환하세요.
      starterCode: |-
        def choose_phone_evidence(situation):
            raise NotImplementedError
      solution: |
        def choose_phone_evidence(situation):
            table = {'format': {'action': 'strip separators and validate length', 'evidence': 'recognized national pattern', 'risk': 'guessed digits'}, 'identity': {'action': 'convert to E.164', 'evidence': 'country code and kind', 'risk': 'duplicate display formats'}, 'contact': {'action': 'check explicit consent', 'evidence': 'consent record', 'risk': 'unauthorized outreach'}}
            if situation not in table:
                raise ValueError('unknown situation')
            return table[situation]
      hints: *id003
    check:
      id: python.regex.regex_02.phone-normalization-recall.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.regex.regex_02.phone-normalization-recall.retrieval.behavior.v1.fixture
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
        entry: choose_phone_evidence
        cases:
        - id: recalls-format
          arguments:
          - value: format
          expectedReturn:
            action: strip separators and validate length
            evidence: recognized national pattern
            risk: guessed digits
        - id: recalls-identity
          arguments:
          - value: identity
          expectedReturn:
            action: convert to E.164
            evidence: country code and kind
            risk: duplicate display formats
        - id: rejects-unknown
          arguments:
          - value: unknown
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};