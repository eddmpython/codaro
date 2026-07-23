var e=`meta:
  id: 19_difflib
  title: difflib - 시퀀스 비교
  category: builtins
  tags:
  - difflib
  - SequenceMatcher
  - unified_diff
  - get_close_matches
  - Differ
  description: 텍스트와 시퀀스 간의 차이점을 찾고 비교하는 difflib 모듈
  keywords:
  - difflib
  - SequenceMatcher
  - unified_diff
  - get_close_matches
  - Differ
intro:
  direction: difflib 시퀀스 비교에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.
  benefits:
  - 작은 샘플 입력 확인 후 모듈 함수 호출에 맞는 코드 입력을 고릅니다.
  - difflib 시퀀스 비교 결과를 반환값, stdout, 객체 상태 기준으로 즉시 점검합니다.
  - 완료한 코드를 표준 라이브러리 유틸리티에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: difflib 모듈 임포트 입력 확인
      detail: 입력 기준(작은 샘플 입력)과 필요한 조건을 먼저 고정합니다.
    - label: SequenceMatcher 처리 실행
      detail: 모듈 함수 호출 코드를 실행해 중간 결과를 확인합니다.
    - label: 텍스트 비교 함수 결과 검증
      detail: 반환값, stdout, 객체 상태 기준으로 실행 결과를 비교합니다.
    - label: difflib 시퀀스 비교 재사용
      detail: 완성 코드를 표준 라이브러리 유틸리티에 붙일 수 있게 정리합니다.
    runtime:
    - label: 표준 라이브러리 환경
      detail: 표준 라이브러리 기준으로 로컬 Python 실행을 준비합니다.
    - label: difflib 시퀀스 비교 실행
      detail: 셀을 실행해 반환값, stdout, 객체 상태와 예외 상태를 확인합니다.
    - label: difflib 시퀀스 비교 완료
      detail: 검증된 코드를 표준 라이브러리 유틸리티로 남깁니다.
sections:
- title: ⚠️ difflib 모듈 임포트
  structuredPrimary: true
  subtitle: 작게 실행하고 결과를 확인하는 단계
  goal: ⚠️ difflib 모듈 임포트에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: import 준비가 정확해야 다음 셀과 자동화 코드에서 같은 이름을 안정적으로 재사용할 수 있습니다.
  explanation: |-
    표준 라이브러리 임포트
    difflib는 Python 표준 라이브러리이므로 별도 설치 없이 사용할 수 있습니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: import difflib
  exercise:
    prompt: ⚠️ difflib 모듈 임포트 예제에서 import한 모듈의 별칭이나 바로 이어지는 확인 호출을 바꿔 준비 상태를 확인하세요.
    starterCode: import difflib
    hints:
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    type: noError
    noError: ⚠️ difflib 모듈 임포트의 import 대상 모듈과 별칭이 현재 로컬 환경에서 준비되어야 합니다.
    resultCheck: ⚠️ difflib 모듈 임포트 다음 셀에서 import한 이름을 사용할 수 있어야 합니다.
  name: module_import
- title: SequenceMatcher 기본
  structuredPrimary: true
  subtitle: 작게 실행하고 결과를 확인하는 단계
  goal: SequenceMatcher 기본에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    SequenceMatcher 클래스
    SequenceMatcher는 두 시퀀스를 비교하고 유사도를 계산하는 클래스입니다.

    ratio() 반환값
    ratio()는 0.0~1.0 사이의 값을 반환하며, 1.0은 완전히 동일함을 의미합니다.
  tips:
  - ratio() 반환값 ratio()는 0.0~1.0 사이의 값을 반환하며, 1.0은 완전히 동일함을 의미합니다.
  snippet: |-
    text1 = "hello world"
    text2 = "hello Python"

    matcher = difflib.SequenceMatcher(None, text1, text2)
    similarity = matcher.ratio()
    similarity
  exercise:
    prompt: SequenceMatcher 기본 예제에서 \`text1\`, \`text2\`, \`matcher\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.
    starterCode: |-
      text1 = "hello world"
      text2 = "hello Python"

      matcher = difflib.SequenceMatcher(None, text1, text2)
      similarity = matcher.ratio()
      similarity
    hints:
    - 바꿀 지점은 \`text1 = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`text1\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: SequenceMatcher 기본에서 \`text1\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: SequenceMatcher 기본 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
  name: sequence_matcher
- title: 텍스트 비교 함수
  structuredPrimary: true
  subtitle: 작게 실행하고 결과를 확인하는 단계
  goal: 텍스트 비교 함수에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    diff 형식 출력
    difflib는 다양한 형식의 diff 출력을 제공합니다.

    unified_diff 용도
    Git과 같은 버전 관리 시스템에서 사용하는 표준 diff 형식입니다.
  tips:
  - unified_diff 용도 Git과 같은 버전 관리 시스템에서 사용하는 표준 diff 형식입니다.
  snippet: |-
    text1 = ["line 1\\n", "line 2\\n", "line 3\\n"]
    text2 = ["line 1\\n", "modified line 2\\n", "line 3\\n", "line 4\\n"]

    diff = difflib.unified_diff(
        text1,
        text2,
        fromfile="original.txt",
        tofile="modified.txt",
        lineterm=""
    )

    diffOutput = "\\n".join(diff)
    diffOutput
  exercise:
    prompt: 텍스트 비교 함수 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      text1 = ["line 1\\n", "line 2\\n", "line 3\\n"]
      text2 = ["line 1\\n", "modified line 2\\n", "line 3\\n", "line 4\\n"]

      diff = difflib.unified_diff(
          text1,
          text2,
          fromfile="original.txt",
          tofile="modified.txt",
          lineterm=""
      )

      diffOutput = "\\n".join(diff)
      diffOutput
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    type: noError
    noError: 텍스트 비교 함수에서 \`text1\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 텍스트 비교 함수 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
  name: text_comparison
- title: 유사 문자열 찾기
  structuredPrimary: true
  subtitle: 작게 실행하고 결과를 확인하는 단계
  goal: 유사 문자열 찾기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    get_close_matches 함수
    get_close_matches는 주어진 문자열과 유사한 문자열을 찾습니다.

    자동 완성 기능
    검색 엔진, 자동 완성, 철자 검사 등에 유용합니다.
  tips:
  - 자동 완성 기능 검색 엔진, 자동 완성, 철자 검사 등에 유용합니다.
  snippet: |-
    word = "appel"
    possibilities = ["apple", "apply", "application", "appreciate", "banana"]

    matches = difflib.get_close_matches(word, possibilities)
    matches
  exercise:
    prompt: 유사 문자열 찾기 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      word = "appel"
      possibilities = ["apple", "apply", "application", "appreciate", "banana"]

      matches = difflib.get_close_matches(word, possibilities)
      matches
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    type: noError
    noError: 유사 문자열 찾기에서 \`word\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 유사 문자열 찾기 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
  name: close_matches
- title: HTML 형식 비교
  structuredPrimary: true
  subtitle: 작게 실행하고 결과를 확인하는 단계
  goal: HTML 형식 비교에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    HtmlDiff 클래스
    HtmlDiff는 두 텍스트의 차이를 HTML 테이블 형식으로 생성합니다.

    HTML 출력
    웹 기반 비교 도구나 리포트 생성에 유용합니다.
  tips:
  - HTML 출력 웹 기반 비교 도구나 리포트 생성에 유용합니다.
  snippet: |-
    text1 = ["Line 1\\n", "Line 2\\n", "Line 3\\n"]
    text2 = ["Line 1\\n", "Modified Line 2\\n", "Line 3\\n", "Line 4\\n"]

    htmlDiff = difflib.HtmlDiff()
    htmlTable = htmlDiff.make_table(text1, text2, fromdesc="Original", todesc="Modified")

    htmlTable[:200]
  exercise:
    prompt: HTML 형식 비교 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      text1 = ["Line 1\\n", "Line 2\\n", "Line 3\\n"]
      text2 = ["Line 1\\n", "Modified Line 2\\n", "Line 3\\n", "Line 4\\n"]

      htmlDiff = difflib.HtmlDiff()
      htmlTable = htmlDiff.make_table(text1, text2, fromdesc="Original", todesc="Modified")

      htmlTable[:200]
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    type: noError
    noError: HTML 형식 비교에서 \`text1\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: HTML 형식 비교 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
  name: html_diff
- title: 고급 기능
  structuredPrimary: true
  subtitle: 작게 실행하고 결과를 확인하는 단계
  goal: 고급 기능에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    유사도 계산 방법
    SequenceMatcher는 여러 유사도 계산 방법을 제공합니다.

    성능 vs 정확도
    quick_ratio < real_quick_ratio이며, 빠르지만 덜 정확합니다.
  tips:
  - 성능 vs 정확도 quick_ratio < real_quick_ratio이며, 빠르지만 덜 정확합니다.
  snippet: |-
    text1 = "The quick brown fox jumps over the lazy dog"
    text2 = "The quick brown cat jumps over the lazy dog"

    matcher = difflib.SequenceMatcher(None, text1, text2)

    {
        "ratio": matcher.ratio(),
        "quick_ratio": matcher.quick_ratio(),
        "real_quick_ratio": matcher.real_quick_ratio()
    }
  exercise:
    prompt: 고급 기능 예제에서 \`text1\`, \`text2\`, \`matcher\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.
    starterCode: |-
      text1 = "The quick brown fox jumps over the lazy dog"
      text2 = "The quick brown cat jumps over the lazy dog"

      matcher = difflib.SequenceMatcher(None, text1, text2)

      {
          "ratio": matcher.ratio(),
          "quick_ratio": matcher.quick_ratio(),
          "real_quick_ratio": matcher.real_quick_ratio()
      }
    hints:
    - 바꿀 지점은 \`text1 = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`text1\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: 고급 기능에서 \`text1\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 고급 기능 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
  name: advanced_usage
- title: 실전 활용 예제
  structuredPrimary: true
  subtitle: 작게 실행하고 결과를 확인하는 단계
  goal: 실전 활용 예제에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: |-
    실무 시나리오
    difflib를 활용한 실전 텍스트 비교 예제를 다룹니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    oldVersion = [
        "import os\\n",
        "def process():\\n",
        "    print('Processing')\\n",
        "    return True\\n"
    ]

    newVersion = [
        "import os\\n",
        "import sys\\n",
        "def process():\\n",
        "    print('Processing data')\\n",
        "    return True\\n"
    ]

    diff = difflib.unified_diff(
        oldVersion,
        newVersion,
        fromfile="script_v1.py",
        tofile="script_v2.py",
        lineterm=""
    )

    changeLog = "\\n".join(diff)
    changeLog
  exercise:
    prompt: 실전 활용 예제 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      oldVersion = [
          "import os\\n",
          "def process():\\n",
          "    print('Processing')\\n",
          "    return True\\n"
      ]

      newVersion = [
          "import os\\n",
          "import sys\\n",
          "def process():\\n",
          "    print('Processing data')\\n",
          "    return True\\n"
      ]

      diff = difflib.unified_diff(
          oldVersion,
          newVersion,
          fromfile="script_v1.py",
          tofile="script_v2.py",
          lineterm=""
      )

      changeLog = "\\n".join(diff)
      changeLog
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: 실전 활용 예제의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 실전 활용 예제 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
  name: practical
- title: '검증 루프: 변경 리포트 품질 게이트'
  structuredPrimary: true
  subtitle: 작게 실행하고 결과를 확인하는 단계
  goal: '검증 루프: 변경 리포트 품질 게이트에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.'
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.
  explanation: |-
    diff를 리포트로 연결하기
    difflib는 차이를 보여주는 데서 끝나면 실무 가치가 약합니다. 변경 유형을 요약하고, 위험한 대규모 변경을 감지하고, 사람이 읽을 수 있는 diff까지 함께 만드는 흐름으로 익혀야 코드 리뷰와 문서 검토에 바로 쓸 수 있습니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    oldDocument = [
        "title: Codaro\\n",
        "runtime: remote-sandbox\\n",
        "lesson: constrained-ui\\n",
        "status: draft\\n"
    ]
    newDocument = [
        "title: Codaro\\n",
        "runtime: local-python\\n",
        "lesson: local workflow\\n",
        "status: reviewed\\n",
        "validation: required\\n"
    ]

    def buildChangeReport(oldLines, newLines, threshold=0.2):
        matcher = difflib.SequenceMatcher(None, oldLines, newLines)
        similarity = matcher.ratio()
        assert similarity >= threshold, "변경 폭이 너무 커서 수동 리뷰가 필요합니다"

        changes = [
            {
                "type": tag,
                "old": f"{i1 + 1}-{i2}",
                "new": f"{j1 + 1}-{j2}"
            }
            for tag, i1, i2, j1, j2 in matcher.get_opcodes()
            if tag != "equal"
        ]
        unified = list(difflib.unified_diff(
            oldLines,
            newLines,
            fromfile="before.yaml",
            tofile="after.yaml",
            lineterm=""
        ))
        return {
            "similarity": round(similarity, 2),
            "changeCount": len(changes),
            "changes": changes,
            "diff": unified
        }

    changeReport = buildChangeReport(oldDocument, newDocument)
    assert changeReport["changeCount"] >= 1
    changeReport
  exercise:
    prompt: '검증 루프: 변경 리포트 품질 게이트 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.'
    starterCode: |-
      oldDocument = [
          "title: Codaro\\n",
          "runtime: remote-sandbox\\n",
          "lesson: constrained-ui\\n",
          "status: draft\\n"
      ]
      newDocument = [
          "title: Codaro\\n",
          "runtime: local-python\\n",
          "lesson: local workflow\\n",
          "status: reviewed\\n",
          "validation: required\\n"
      ]

      def buildChangeReport(oldLines, newLines, threshold=0.2):
          matcher = difflib.SequenceMatcher(None, oldLines, newLines)
          similarity = matcher.ratio()
          assert similarity >= threshold, "변경 폭이 너무 커서 수동 리뷰가 필요합니다"

          changes = [
              {
                  "type": tag,
                  "old": f"{i1 + 1}-{i2}",
                  "new": f"{j1 + 1}-{j2}"
              }
              for tag, i1, i2, j1, j2 in matcher.get_opcodes()
              if tag != "equal"
          ]
          unified = list(difflib.unified_diff(
              oldLines,
              newLines,
              fromfile="before.yaml",
              tofile="after.yaml",
              lineterm=""
          ))
          return {
              "similarity": round(similarity, 2),
              "changeCount": len(changes),
              "changes": changes,
              "diff": unified
          }

      changeReport = buildChangeReport(oldDocument, newDocument)
      assert changeReport["changeCount"] >= 1
      changeReport
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    type: noError
    noError: '검증 루프: 변경 리포트 품질 게이트의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.'
    resultCheck: '검증 루프: 변경 리포트 품질 게이트 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.'
  name: workflow_validation
- title: 연습 문제
  structuredPrimary: true
  subtitle: 작게 실행하고 결과를 확인하는 단계
  goal: 연습 문제에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: 연습 문제의 핵심 흐름을 예제 코드로 확인하고, 같은 구조를 직접 실행해 결과를 검증한다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    text1 = "hello world"
    text2 = "hello python"
    matcher = difflib.SequenceMatcher(None, text1, text2)
    result = matcher.ratio()
    result
  exercise:
    prompt: 연습 문제 예제에서 \`text1\`, \`text2\`, \`matcher\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.
    starterCode: |-
      text1 = "hello world"
      text2 = "hello python"
      matcher = difflib.SequenceMatcher(None, text1, text2)
      result = matcher.ratio()
      result
    hints:
    - 바꿀 지점은 \`text1 = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`text1\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: 연습 문제에서 \`text1\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 연습 문제 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
  name: practice
assessment:
  masteryVariants:
  - id: 19_difflib-change-report-mastery
    mode: mastery
    unseen: true
    sourceSectionIds:
    - sequence_matcher
    - text_comparison
    - workflow_validation
    title: 문서 변경 폭과 diff 통계를 리포트로 만들기
    subtitle: SequenceMatcher와 unified_diff
    goal: old/new line 목록을 비교해 similarity, change 종류, 추가·삭제 줄 수, diff header를 반환한다.
    why: difflib 학습은 diff 문자열을 보기만 하는 데서 끝나지 않고, 리뷰가 필요한 변경인지 구조화된 근거로 판단할 때 실무에 연결됩니다.
    explanation: 함수 본문을 완성하면 격리된 Python Worker가 보이지 않는 문서 버전 두 개를 넘겨 변경 폭과 실패 조건을 함께 검증합니다.
    tips:
    - SequenceMatcher.ratio가 threshold보다 낮으면 ValueError로 막으세요.
    - unified_diff의 파일 header는 추가·삭제 줄 수에서 제외하세요.
    exercise:
      prompt: build_change_report(old_lines, new_lines, threshold=0.2)가 similarity, changeCount, changeTypes, addedLineCount,
        removedLineCount, firstDiff를 담은 dict를 반환하도록 완성하세요.
      starterCode: |-
        def build_change_report(old_lines, new_lines, threshold=0.2):
            raise NotImplementedError
      solution: |-
        import difflib

        def build_change_report(old_lines, new_lines, threshold=0.2):
            matcher = difflib.SequenceMatcher(None, old_lines, new_lines)
            similarity = matcher.ratio()
            if similarity < threshold:
                raise ValueError("manual review required")
            changes = [
                {
                    "type": tag,
                    "old": f"{i1 + 1}-{i2}",
                    "new": f"{j1 + 1}-{j2}",
                }
                for tag, i1, i2, j1, j2 in matcher.get_opcodes()
                if tag != "equal"
            ]
            unified = list(difflib.unified_diff(
                old_lines,
                new_lines,
                fromfile="before.yaml",
                tofile="after.yaml",
                lineterm="",
            ))
            added = [line for line in unified if line.startswith("+") and not line.startswith("+++")]
            removed = [line for line in unified if line.startswith("-") and not line.startswith("---")]
            return {
                "similarity": round(similarity, 2),
                "changeCount": len(changes),
                "changeTypes": [change["type"] for change in changes],
                "addedLineCount": len(added),
                "removedLineCount": len(removed),
                "firstDiff": unified[0] if unified else "",
            }
      hints:
      - get_opcodes에서 equal은 변경 목록에서 제외하세요.
      - unified_diff header는 \`---\`, \`+++\`로 시작합니다.
    check:
      id: python.builtins.difflib.change-report.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.difflib.review.behavior.v1.fixture
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
        entry: build_change_report
        cases:
        - id: reports-document-change
          arguments:
          - value:
            - |
              title: Codaro
            - |
              runtime: remote-sandbox
            - |
              lesson: constrained-ui
            - |
              status: draft
          - value:
            - |
              title: Codaro
            - |
              runtime: local-python
            - |
              lesson: local workflow
            - |
              status: reviewed
            - |
              validation: required
          - value: 0.2
          expectedReturn:
            similarity: 0.22
            changeCount: 1
            changeTypes:
            - replace
            addedLineCount: 4
            removedLineCount: 3
            firstDiff: '--- before.yaml'
        - id: rejects-too-large-change
          arguments:
          - value:
            - |
              a
            - |
              a
          - value:
            - |
              x
            - |
              x
            - |
              x
            - |
              x
            - |
              x
            - |
              x
            - |
              x
            - |
              x
            - |
              x
            - |
              x
          - value: 0.9
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
  transferVariants:
  - id: 19_difflib-command-suggestion-transfer
    mode: transfer
    unseen: true
    sourceSectionIds:
    - 19_difflib-change-report-mastery
    - close_matches
    title: 오타 난 명령어에 가까운 후보 추천하기
    subtitle: get_close_matches와 command metadata
    goal: query와 command 목록을 받아 가장 가까운 command 이름과 설명을 추천한다.
    why: 전이 과제에서는 문서 diff가 아니라 자동완성·철자 보정 문제로 옮겨, 같은 유사도 감각을 사용자 입력 복구에 적용합니다.
    explanation: 숙달 검증이 저장된 뒤 자동으로 열리는 새 조건 과제입니다. 이름 목록으로 match를 찾고 원래 command metadata를 다시 붙이세요.
    tips:
    - 빈 query나 빈 commands는 ValueError로 막으세요.
    - get_close_matches의 결과 순서를 그대로 유지하세요.
    exercise:
      prompt: suggest_command_matches(query, commands, cutoff=0.6)가 query, matches, matchCount를 담은 dict를 반환하도록 완성하세요.
      starterCode: |-
        def suggest_command_matches(query, commands, cutoff=0.6):
            raise NotImplementedError
      solution: |-
        import difflib

        def suggest_command_matches(query, commands, cutoff=0.6):
            if not query or not commands:
                raise ValueError("query and commands are required")
            names = [command["name"] for command in commands]
            matches = difflib.get_close_matches(query, names, n=3, cutoff=cutoff)
            by_name = {command["name"]: command for command in commands}
            return {
                "query": query,
                "matches": [
                    {"name": name, "description": by_name[name]["description"]}
                    for name in matches
                ],
                "matchCount": len(matches),
            }
      hints:
      - get_close_matches에는 command 이름 목록만 넘기고, 설명은 나중에 다시 붙이세요.
      - cutoff를 함수 인자로 받아야 다른 엄격도에도 재사용할 수 있습니다.
    check:
      id: python.builtins.difflib.command-suggestion.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.difflib.review.behavior.v1.fixture
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
        entry: suggest_command_matches
        cases:
        - id: suggests-close-command
          arguments:
          - value: verfy
          - value:
            - name: verify
              description: Run validation checks
            - name: version
              description: Show installed version
            - name: export
              description: Create report archive
            - name: run
              description: Execute selected lesson
          - value: 0.6
          expectedReturn:
            query: verfy
            matches:
            - name: verify
              description: Run validation checks
            matchCount: 1
        - id: rejects-empty-query
          arguments:
          - value: ''
          - value:
            - name: verify
              description: Run validation checks
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
  retrievalVariants:
  - id: 19_difflib-line-diff-retrieval
    mode: retrieval
    unseen: true
    sourceSectionIds:
    - 19_difflib-command-suggestion-transfer
    title: 라인 단위 변경 내용을 다시 요약하기
    subtitle: Differ와 SequenceMatcher 재확인
    goal: old/new multiline text를 비교해 added, removed, hintCount, similarity를 반환한다.
    why: 시간이 지나도 difflib에서 남아야 할 감각은 diff 출력 형식보다, 변경된 줄과 유사도 신호를 함께 읽어 다음 행동을 결정하는 능력입니다.
    explanation: 숙달 근거가 저장된 지 24시간이 지나면 자동으로 열립니다. 이번에는 unified diff가 아니라 Differ.compare 결과를 구조화하세요.
    tips:
    - '\`+ \`로 시작하는 줄은 추가, \`- \`로 시작하는 줄은 삭제입니다.'
    - '\`? \` 줄은 문자 단위 hint이므로 count만 반환하세요.'
    exercise:
      prompt: summarize_line_diff(old_text, new_text)가 added, removed, hintCount, similarity를 담은 dict를 반환하도록 완성하세요.
      starterCode: |-
        def summarize_line_diff(old_text, new_text):
            raise NotImplementedError
      solution: |-
        import difflib

        def summarize_line_diff(old_text, new_text):
            old_lines = old_text.splitlines()
            new_lines = new_text.splitlines()
            diff = list(difflib.Differ().compare(old_lines, new_lines))
            added = [line[2:] for line in diff if line.startswith("+ ")]
            removed = [line[2:] for line in diff if line.startswith("- ")]
            hints = [line[2:] for line in diff if line.startswith("? ")]
            ratio = difflib.SequenceMatcher(None, old_lines, new_lines).ratio()
            return {
                "added": added,
                "removed": removed,
                "hintCount": len(hints),
                "similarity": round(ratio, 2),
            }
      hints:
      - splitlines는 마지막 개행 여부에 덜 민감합니다.
      - added와 removed는 marker 두 글자를 제거해 반환하세요.
    check:
      id: python.builtins.difflib.line-diff.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.builtins.difflib.review.behavior.v1.fixture
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
        entry: summarize_line_diff
        cases:
        - id: summarizes-line-diff
          arguments:
          - value: |-
              alpha
              beta
              gamma
          - value: |-
              alpha
              beta changed
              gamma
              delta
          expectedReturn:
            added:
            - beta changed
            - delta
            removed:
            - beta
            hintCount: 0
            similarity: 0.57
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